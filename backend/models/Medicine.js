const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    type: String,
    requiresPrescription: { type: Boolean, default: false }
});

module.exports = mongoose.model("Medicine", medicineSchema);