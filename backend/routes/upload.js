const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { upload } = require("../config/cloudinary");

// ── Auth middleware ───────────────────────────────────────────────────────────
const authenticate = (req, res, next) => {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: "No token provided." });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/upload
// Body: multipart/form-data  →  field name: "image"
// Query: ?folder=mediquick/stores  (optional, defaults to mediquick/uploads)
//
// Returns: { url, publicId }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", authenticate, upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No image file provided." });
    }
    return res.status(201).json({
        message: "Uploaded successfully.",
        url: req.file.path,        // Cloudinary secure URL
        publicId: req.file.filename,    // Cloudinary public_id (for deletion)
    });
});

module.exports = router;
