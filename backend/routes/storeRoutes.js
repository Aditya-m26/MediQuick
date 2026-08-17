const express = require("express");
const router = express.Router();
const Store = require("../models/Store");

// @route   GET /api/stores
// @desc    Get all stores
router.get("/", async (req, res) => {
    try {
        const stores = await Store.find().populate("medicines.medicineId");
        res.status(200).json(stores);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
