/**
 * Quick check – prints how many medicines are in the DB
 * Run: node check.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

const Medicine = require("./models/Medicine");

async function check() {
    console.log("\n🔌  Connecting to:", process.env.MONGO_URI.replace(/:([^:@]+)@/, ":****@"));
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log("✅  Connected!\n");

    const count = await Medicine.countDocuments();
    console.log(`💊  Total medicines in DB: ${count}`);

    if (count > 0) {
        const samples = await Medicine.find().limit(3).select("name category price");
        console.log("\n   First 3 entries:");
        samples.forEach((m, i) => console.log(`   ${i + 1}. ${m.name} – ${m.category} – ₹${m.price}`));
    }
    console.log();
    await mongoose.disconnect();
}

check().catch((err) => {
    console.error("❌  Error:", err.message);
    process.exit(1);
});
