const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
    {
        storeName: { type: String, required: true },
        photo: { type: String, default: "" },      // Cloudinary URL
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String },
        phone: { type: String },
        licenceNo: { type: String },
        timings: { type: String },                   // "8:00 AM – 10:00 PM"
        closingTime: { type: String },                   // "10:00 PM"
        rating: { type: Number, default: 4.0 },
        reviews: { type: Number, default: 0 },
        delivery: { type: String, default: "20–30 min" },
        isOpen: { type: Boolean, default: true },
        lat: { type: Number, required: true },   // latitude
        lng: { type: Number, required: true },   // longitude
    },
    { timestamps: true }
);

module.exports = mongoose.model("Store", storeSchema);
