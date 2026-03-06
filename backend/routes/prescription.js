const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
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
// Google Cloud Vision OCR via REST API
// Requires GOOGLE_VISION_API_KEY in .env
// ─────────────────────────────────────────────────────────────────────────────
async function ocrWithGoogleVision(imageUrl) {
    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_VISION_API_KEY not set in .env");

    const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    const body = {
        requests: [
            {
                image: { source: { imageUri: imageUrl } },
                features: [{ type: "TEXT_DETECTION" }],
            },
        ],
    };

    const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await res.json();

    if (data.error) {
        throw new Error(data.error.message || "Vision API error");
    }

    const responses = data.responses || [];
    if (!responses.length || !responses[0].textAnnotations) {
        return "";
    }

    // First annotation = full extracted text
    return responses[0].textAnnotations[0].description || "";
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/prescription/scan
// Body: multipart/form-data → field name: "prescription"
//
// Flow:
//   1. Upload image to Cloudinary
//   2. Send Cloudinary URL to Google Cloud Vision for OCR
//   3. Parse extracted text for medicine candidates
//   4. Fuzzy-match candidates against medicines collection
//   5. Return { imageUrl, extractedText, medicines }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/scan", authenticate, (req, res, next) => {
    upload.single("prescription")(req, res, (err) => {
        if (err) {
            console.error("[UPLOAD] Error:", err.message);
            return res.status(400).json({ message: "Image upload failed: " + err.message });
        }
        next();
    });
}, async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No prescription image provided." });
    }

    const imageUrl = req.file.path; // Cloudinary URL
    console.log("[RX] Image uploaded:", imageUrl);

    try {
        // ── Step 1: Google Vision OCR ────────────────────────────────────────
        console.log("[OCR] Calling Google Cloud Vision...");
        const extractedText = await ocrWithGoogleVision(imageUrl);
        console.log("[OCR] Extracted:", extractedText.substring(0, 300));

        if (!extractedText.trim()) {
            return res.json({
                imageUrl,
                extractedText: "",
                medicines: [],
                message: "Could not extract text from the image. Try a clearer photo.",
            });
        }

        // ── Step 2: Parse candidate medicine names ──────────────────────────
        const lines = extractedText
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter((l) => l.length > 2);

        const candidates = new Set();
        for (const line of lines) {
            candidates.add(line);
            const words = line.split(/[\s,;|/]+/);
            for (const w of words) {
                const clean = w.replace(/[^a-zA-Z0-9]/g, "");
                if (clean.length >= 3 && !/^\d+$/.test(clean)) {
                    candidates.add(clean);
                }
            }
        }

        // ── Step 3: Fuzzy-match against medicines DB ────────────────────────
        const matched = new Map();

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
                // skip invalid regex
            }
        }

        const medicines = Array.from(matched.values());
        console.log(`[OCR] Matched ${medicines.length} medicine(s) from ${candidates.size} candidates`);

        return res.json({
            imageUrl,
            extractedText,
            medicines,
            message: medicines.length
                ? `Found ${medicines.length} medicine(s) from your prescription.`
                : "Could not match any medicines. Try searching manually.",
        });

    } catch (err) {
        console.error("[OCR] Error:", err.message || err);
        return res.status(500).json({
            message: "OCR failed: " + (err.message || "Unknown error"),
            imageUrl,
        });
    }
});

module.exports = router;
