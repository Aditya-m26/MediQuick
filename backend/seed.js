/**
 * MediQuick – Medicine Seeder
 * Usage:
 *   node seed.js              → insert new, skip duplicates
 *   node seed.js --clear      → wipe medicines collection first, then insert
 *   node seed.js myfile.json  → use a custom file name
 */
require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");
const Medicine = require("./models/Medicine");

// ── Args ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const doClear = args.includes("--clear");
const fileArg = args.find(a => !a.startsWith("--")) || "Medecines50.json";
const filePath = path.resolve(__dirname, fileArg);

if (!fs.existsSync(filePath)) {
    console.error(`\n❌  File not found: ${filePath}\n`);
    process.exit(1);
}

let raw;
try { raw = JSON.parse(fs.readFileSync(filePath, "utf-8")); }
catch (e) { console.error("\n❌  Invalid JSON:", e.message); process.exit(1); }

if (!Array.isArray(raw)) {
    console.error("\n❌  JSON must be an array."); process.exit(1);
}

// ── Transform ─────────────────────────────────────────────────────────────────
// Input:  price = "₹10–₹20 (10 tablets)"
// Output: price (number), estimatedPrice (range string), packSize (pack description)
function transform(item) {
    const priceStr = String(item.price || "");

    // Extract all numbers
    const nums = priceStr.match(/\d+/g) || [];
    const numericPrice = nums.length >= 1 ? parseInt(nums[0], 10) : 0;
    const estimatedPrice = nums.length >= 2
        ? `₹${nums[0]}–₹${nums[1]}`
        : nums.length === 1 ? `₹${nums[0]}` : "";

    // Extract pack size from parenthetical: "(10 tablets)" → "10 tablets"
    const packMatch = priceStr.match(/\(([^)]+)\)/);
    const packSize = packMatch ? packMatch[1] : "";

    // prescription_required → prescription
    const rxRaw = item.prescription_required ?? item.prescription;
    let prescription = false;
    if (typeof rxRaw === "boolean") prescription = rxRaw;
    else if (typeof rxRaw === "string") prescription = rxRaw.trim().toUpperCase() === "TRUE";

    return {
        name: String(item.name || "").trim(),
        price: numericPrice,
        description: String(item.description || "").trim(),
        category: String(item.category || "").trim(),
        type: String(item.type || "").trim(),
        estimatedPrice: estimatedPrice,
        packSize: packSize,
        prescription: prescription,
        inStock: true,
    };
}

async function seed() {
    try {
        console.log("\n🔌  Connecting to MongoDB…");
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
        console.log("✅  Connected!\n");

        if (doClear) {
            const del = await Medicine.deleteMany({});
            console.log(`🗑️   Cleared ${del.deletedCount} existing medicines.\n`);
        }

        const valid = raw.map(transform).filter((m, i) => {
            if (!m.name || !m.category || !m.type) {
                console.warn(`  ⚠️  Item #${i + 1} skipped (missing required fields)`);
                return false;
            }
            return true;
        });

        console.log(`📦  ${raw.length} items in JSON → ${valid.length} valid`);

        const ops = valid.map(med => ({
            updateOne: {
                filter: { name: { $regex: `^${med.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } },
                update: { $setOnInsert: med },
                upsert: true,
            },
        }));

        const result = await Medicine.bulkWrite(ops, { ordered: false });
        console.log(`\n🎉  Done!`);
        console.log(`   ✅ Inserted (new):             ${result.upsertedCount}`);
        console.log(`   ⏭️  Already existed (skipped): ${result.matchedCount}\n`);
    } catch (err) {
        console.error("\n❌  Seeder error:", err.message);
    } finally {
        await mongoose.disconnect();
        console.log("🔌  Disconnected.\n");
        process.exit(0);
    }
}

seed();
