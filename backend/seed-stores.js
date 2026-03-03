/**
 * seed-stores.js – seeds stores from Stores.json into MongoDB
 *
 * Usage:
 *   node seed-stores.js           → upsert (add new, skip existing)
 *   node seed-stores.js --clear   → wipe collection then insert all
 */

require("dotenv").config();
const mongoose = require("mongoose");
const dns = require("dns");
const fs = require("fs");
const path = require("path");
const Store = require("./models/Store");

dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

const clearFirst = process.argv.includes("--clear");
const jsonFile = path.join(__dirname, "Stores.json");

async function seed() {
    console.log("\n🔌  Connecting to MongoDB…");
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log("✅  Connected!\n");

    if (clearFirst) {
        await Store.deleteMany({});
        console.log("🗑️  Collection cleared.\n");
    }

    const raw = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
    console.log(`📦  ${raw.length} stores in JSON`);

    let inserted = 0, skipped = 0;
    for (const s of raw) {
        const result = await Store.updateOne(
            { storeName: s.storeName, city: s.city },
            { $setOnInsert: s },
            { upsert: true }
        );
        if (result.upsertedCount) inserted++;
        else skipped++;
    }

    console.log("\n🎉  Done!");
    console.log(`   ✅ Inserted (new):             ${inserted}`);
    console.log(`   ⏭️  Already existed (skipped): ${skipped}\n`);

    await mongoose.disconnect();
    console.log("🔌  Disconnected.");
}

seed().catch(err => { console.error(err); process.exit(1); });
