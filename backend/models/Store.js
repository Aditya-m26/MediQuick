const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: String,
    latitude: Number,
    longitude: Number,
    phone: String,
    medicines: [
        {
            medicineId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Medicine"
            },
            stock: {
                type: Number,
                default: 0
            }
        }
    ]
});

module.exports = mongoose.model("Store", storeSchema);