const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["patient", "manager"],
            required: true,
        },

        // ── Common credentials ──────────────────────────
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },

        // ── Patient fields ──────────────────────────────
        fullName: { type: String },
        mobile: { type: String },
        gender: { type: String },
        age: { type: Number },
        city: { type: String },
        state: { type: String },
        healthCondition: { type: String, default: "" },

        // ── Store Manager fields ────────────────────────
        storeName: { type: String },
        address: { type: String },
        pincode: { type: String },
        phone: { type: String },
        licenceNo: { type: String },
        managerName: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
