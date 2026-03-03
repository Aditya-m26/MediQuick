const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Medicine = require("../models/Medicine");

// ─── Auth middleware ───────────────────────────────────────────────────────────
function authRequired(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorised – token missing." });
    }
    try {
        req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ message: "Unauthorised – invalid token." });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/medicines/search?name=para
//   Returns up to 8 suggestions matching the query (autocomplete)
//   Uses REGEX so partial names like "Para" match "Paracetamol"
//   Auth required
// ─────────────────────────────────────────────────────────────────────────────
router.get("/search", authRequired, async (req, res) => {
    const { name } = req.query;
    if (!name || name.trim().length < 2) {
        return res.status(400).json({ message: "Query must be at least 2 characters." });
    }
    try {
        // Escape special regex characters
        const escaped = name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const medicines = await Medicine.find({
            name: { $regex: escaped, $options: "i" },   // case-insensitive partial match
        })
            .limit(8)
            .select("name category type price prescription");

        return res.json({ medicines });
    } catch (err) {
        console.error("Medicine search error:", err.message);
        return res.status(500).json({ message: "Server error." });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/medicines/detail?name=Paracetamol+500+mg
//   Returns FULL detail for a single medicine by name
//   1st: exact match  →  2nd: starts-with  →  3rd: contains
//   Auth required
// ─────────────────────────────────────────────────────────────────────────────
router.get("/detail", authRequired, async (req, res) => {
    const { name } = req.query;
    if (!name || !name.trim()) {
        return res.status(400).json({ message: "name query param is required." });
    }
    const q = name.trim();
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    try {
        // 1. Exact match (case-insensitive)
        let medicine = await Medicine.findOne({
            name: { $regex: `^${escaped}$`, $options: "i" },
        });

        // 2. Starts-with
        if (!medicine) {
            medicine = await Medicine.findOne({
                name: { $regex: `^${escaped}`, $options: "i" },
            });
        }

        // 3. Contains anywhere
        if (!medicine) {
            medicine = await Medicine.findOne({
                name: { $regex: escaped, $options: "i" },
            });
        }

        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found." });
        }

        return res.json({ medicine });
    } catch (err) {
        console.error("Medicine detail error:", err.message);
        return res.status(500).json({ message: "Server error." });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/medicines/:id
//   Returns full detail by MongoDB _id
//   Auth required
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id", authRequired, async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found." });
        }
        return res.json({ medicine });
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid medicine ID." });
        }
        console.error("Medicine by ID error:", err.message);
        return res.status(500).json({ message: "Server error." });
    }
});

module.exports = router;
