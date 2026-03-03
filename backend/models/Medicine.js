const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        price: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            // e.g. Tablet, Capsule, Syrup, Injection, Cream
            type: String,
            required: true,
        },
        estimatedPrice: {
            // descriptive range string, e.g. "₹18–₹22 / strip"
            type: String,
            default: "",
        },
        prescription: {
            type: Boolean,
            default: false,
        },
        // Optional fields for richer data later
        manufacturer: { type: String, default: "" },
        packSize: { type: String, default: "" }, // e.g. "10 tablets/strip"
        sideEffects: { type: String, default: "" },
        inStock: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// text index for full-text search across name, category, description
medicineSchema.index(
    { name: "text", category: "text", description: "text" },
    { weights: { name: 10, category: 5, description: 1 } }
);

module.exports = mongoose.model("Medicine", medicineSchema);
