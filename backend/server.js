require("dotenv").config();
const dns = require("dns");
// Fix: override local DNS proxy that doesn't support SRV records
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

// ── Routes ──────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));

// ── Health check ────────────────────────────────────
app.get("/", (req, res) => {
  res.send("MediQuick Backend is running 🚀");
});

// ── DB + Server ─────────────────────────────────────
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log("MongoDB Connected ✅");
  } catch (err) {
    console.log("MongoDB Error:", err.message);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
  });
});
