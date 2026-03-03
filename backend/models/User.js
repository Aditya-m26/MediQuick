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

        // ── Patient – basic ─────────────────────────────
        fullName: { type: String },
        mobile: { type: String },
        gender: { type: String },
        age: { type: Number },
        dob: { type: String },   // YYYY-MM-DD
        city: { type: String },
        state: { type: String },
        address: { type: String },
        pin: { type: String },
        healthCondition: { type: String, default: "" },

        // ── Patient – extended health ───────────────────
        blood: { type: String },
        weight: { type: String },
        height: { type: String },
        allergy: { type: String },
        meds: { type: String },

        // ── Emergency contact ───────────────────────────
        ecName: { type: String },
        ecRel: { type: String },
        ecPhone: { type: String },

        // ── Doctor info ─────────────────────────────────
        drName: { type: String },
        drSpec: { type: String },
        drPhone: { type: String },
        drHosp: { type: String },

        // ── Store Manager fields ────────────────────────
        storeName: { type: String },
        address_mgr: { type: String },
        pincode: { type: String },
        phone: { type: String },
        licenceNo: { type: String },
        managerName: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
