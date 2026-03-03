const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Store = require("../models/Store");

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

// ── Haversine distance (km) ───────────────────────────────────────────────────
function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/stores
// Query params (optional): lat, lng   → attaches distanceKm and sorts
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", authenticate, async (req, res) => {
    try {
        const stores = await Store.find({}).lean();

        const userLat = parseFloat(req.query.lat);
        const userLng = parseFloat(req.query.lng);
        const hasLocation = !isNaN(userLat) && !isNaN(userLng);

        const result = stores.map(s => ({
            ...s,
            distanceKm: hasLocation
                ? parseFloat(haversine(userLat, userLng, s.lat, s.lng).toFixed(1))
                : null,
        }));

        if (hasLocation) {
            result.sort((a, b) => a.distanceKm - b.distanceKm);
        }

        return res.json({ stores: result });
    } catch (err) {
        console.error("Stores fetch error:", err.message);
        return res.status(500).json({ message: "Server error." });
    }
});

module.exports = router;
