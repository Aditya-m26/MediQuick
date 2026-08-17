const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        userName: String,
        userEmail: String,

        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store"
        },

        items: [
            {
                medicineId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Medicine"
                },
                name: String,
                quantity: Number,
                price: Number
            }
        ],

        totalAmount: Number,

        deliveryType: {
            type: String,
            enum: ["standard", "emergency"],
            default: "standard"
        },

        prescriptionUrl: String,

        status: {
            type: String,
            enum: ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"],
            default: "pending"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);