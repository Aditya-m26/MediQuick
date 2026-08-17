const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// @route   POST /api/orders
// @desc    Create a new order
router.post("/", async (req, res) => {
    try {
        const {
            userName,
            userEmail,
            storeId,
            items,
            totalAmount,
            deliveryType,
            prescriptionUrl
        } = req.body;

        // Validate required fields
        if (!userName || !userEmail || !storeId || !items || totalAmount === undefined) {
            return res.status(400).json({
                message: "Please provide all required fields: userName, userEmail, storeId, items, totalAmount"
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Items must be a non-empty array"
            });
        }

        const order = new Order({
            userName,
            userEmail,
            storeId,
            items,
            totalAmount,
            deliveryType: deliveryType || "standard",
            prescriptionUrl,
            status: "pending"
        });

        const savedOrder = await order.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
router.get("/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("storeId")
            .populate("items.medicineId");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
