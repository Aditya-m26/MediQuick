require("dotenv").config();
const dns = require("dns");
const path = require("path");

// Fix: override local DNS proxy that doesn't support SRV records
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// ── Serve frontend static files ─────────────────────────────────────────────
// The frontend folder lives at ../frontend relative to this file (backend/)
const FRONTEND = path.join(__dirname, "../frontend");
app.use(express.static(FRONTEND));

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/medicines", require("./routes/medicines"));
app.use("/api/stores", require("./routes/stores"));

// ── Catch-all: serve login page for any non-API route ───────────────────────
// Express v5 requires `/*splat` instead of `*`
app.get("/*splat", (req, res) => {
  res.sendFile(path.join(FRONTEND, "index.html"));
});

// ── DB + Server ──────────────────────────────────────────────────────────────
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
    console.log(`Frontend served from: ${FRONTEND}`);
  });
});
