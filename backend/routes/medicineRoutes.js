const express = require("express");
const router = express.Router();
const Medicine = require("../models/Medicine");

// @route   GET /api/medicines
// @desc    Get all medicines
router.get("/", async (req, res) => {
    try {
        const medicines = await Medicine.find();
        res.status(200).json(medicines);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// @route   GET /api/medicines/:id
// @desc    Get a single medicine by ID
router.get("/:id", async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }
        res.status(200).json(medicine);
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(404).json({ message: "Medicine not found" });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
