const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Tesseract = require("tesseract.js");
const { upload } = require("../config/cloudinary");
const Medicine = require("../models/Medicine");

// ── Auth middleware ───────────────────────────────────────────────────────────
function authenticate(req, res, next) {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: "No token provided." });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/prescription/scan
// Body: multipart/form-data → field name: "prescription"
//
// Flow:
//   1. Upload image to Cloudinary (mediquick/prescriptions)
//   2. Run Tesseract.js OCR on the Cloudinary URL
//   3. Extract candidate medicine names from OCR text
//   4. Fuzzy-match each candidate against the medicines collection
//   5. Return { imageUrl, extractedText, medicines }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/scan", authenticate, upload.single("prescription"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No prescription image provided." });
    }

    const imageUrl = req.file.path; // Cloudinary URL

    try {
        // ── Step 1: OCR ──────────────────────────────────────────────────────
        console.log("[OCR] Starting Tesseract on:", imageUrl);
        const { data } = await Tesseract.recognize(imageUrl, "eng", {
            logger: (m) => {
                if (m.status === "recognizing text") {
                    console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
                }
            },
        });

        const extractedText = data.text || "";
        console.log("[OCR] Extracted text:", extractedText.substring(0, 200));

        if (!extractedText.trim()) {
            return res.json({
                imageUrl,
                extractedText: "",
                medicines: [],
                message: "Could not extract any text from the image. Try a clearer photo.",
            });
        }

        // ── Step 2: Parse medicine candidates ────────────────────────────────
        // Split text into lines, then into words/phrases
        // Filter out very short tokens or purely numeric ones
        const lines = extractedText
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter((l) => l.length > 2);

        // Collect candidate phrases: full lines + individual words (3+ chars)
        const candidates = new Set();
        for (const line of lines) {
            candidates.add(line);
            // Also split by common delimiters
            const words = line.split(/[\s,;|/]+/);
            for (const w of words) {
                const clean = w.replace(/[^a-zA-Z0-9]/g, "");
                if (clean.length >= 3 && !/^\d+$/.test(clean)) {
                    candidates.add(clean);
                }
            }
        }

        // ── Step 3: Fuzzy-match against DB ───────────────────────────────────
        const matched = new Map(); // Use map to avoid duplicates by _id

        for (const term of candidates) {
            const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            try {
                const results = await Medicine.find({
                    name: { $regex: escaped, $options: "i" },
                })
                    .limit(3)
                    .select("name price category type prescription estimatedPrice packSize");

                for (const med of results) {
                    if (!matched.has(med._id.toString())) {
                        matched.set(med._id.toString(), med);
                    }
                }
            } catch {
                // skip invalid regex terms
            }
        }

        const medicines = Array.from(matched.values());
        console.log(`[OCR] Matched ${medicines.length} medicines from ${candidates.size} candidates.`);

        return res.json({
            imageUrl,
            extractedText,
            medicines,
            message: medicines.length
                ? `Found ${medicines.length} medicine(s) from your prescription.`
                : "Could not match any medicines. Try searching manually.",
        });
    } catch (err) {
        console.error("[OCR] Error:", err);
        return res.status(500).json({
            message: "OCR processing failed. Please try again.",
            imageUrl,
        });
    }
});

module.exports = router;
