// server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// ——— MongoDB Connection ———
const MONGO_URI =
  "mongodb+srv://adithya:adithya@humandtcluster.chspl.mongodb.net/mern_portal_db?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 30000, // 30s
});

// Log connection events
mongoose.connection.on("connected", () => {
  console.log("✅ Mongoose connected to Atlas");
});
mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  Mongoose disconnected");
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection at:", reason);
});

// ——— Models ———
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const User = mongoose.model("User", userSchema);

const profileSchema = new mongoose.Schema({
  username: String,
  name: String,
  dob: Date,
  address: String,
  age: Number,
});
const Profile = mongoose.model("Profile", profileSchema);

const heartRateSchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
  heartRate: Number,
  time: Date,
});
const HeartRate = mongoose.model("HeartRate", heartRateSchema);

// ——— Endpoints ———

// 1) Login
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    res.json({ success: true, message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 2) Profile (create defaults if missing)
app.get("/api/profile", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username)
      return res.status(400).json({ error: "Username not provided" });

    let profile = await Profile.findOne({ username });
    if (!profile) {
      const defaults = {
        adithya: {
          name: "Adithya Kumar",
          dob: new Date("1990-01-01"),
          address: "123 Main St",
          age: 30,
        },
        rohit: {
          name: "Rohit Sharma",
          dob: new Date("1988-05-15"),
          address: "456 Side St",
          age: 32,
        },
      }[username];
      if (!defaults)
        return res.status(404).json({ error: "Profile not found" });
      profile = await Profile.create({ username, ...defaults });
    }
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// 3) Heart Rate — seed once, then read
app.get("/api/heartrate", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username)
      return res.status(400).json({ error: "Username not provided" });

    const profile = await Profile.findOne({ username });
    if (!profile) return res.status(400).json({ error: "Profile not found" });

    let heartRates = await HeartRate.find({ profileId: profile._id }).sort(
      "time"
    );
    if (heartRates.length === 0) {
      // Seed 7 days × 24 hours from local midnight 6 days ago
      const now = new Date();
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 6,
        0,
        0,
        0
      );
      const seed = [];
      for (let d = 0; d < 7; d++) {
        for (let h = 0; h < 24; h++) {
          const dt = new Date(start);
          dt.setDate(start.getDate() + d);
          dt.setHours(h, 0, 0, 0);
          seed.push({
            profileId: profile._id,
            heartRate: Math.floor(45 + Math.random() * 76),
            time: dt,
          });
        }
      }
      await HeartRate.insertMany(seed);
      heartRates = await HeartRate.find({ profileId: profile._id }).sort(
        "time"
      );
    }

    res.json(
      heartRates.map((doc) => ({
        heartRate: doc.heartRate,
        time: doc.time,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 4) Trends — compute daily box-plot stats
app.get("/api/trends", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username)
      return res.status(400).json({ error: "Username not provided" });

    const profile = await Profile.findOne({ username });
    if (!profile) return res.status(400).json({ error: "Profile not found" });

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const rates = await HeartRate.find({
      profileId: profile._id,
      time: { $gte: weekAgo },
    }).sort("time");

    if (!rates.length) {
      return res.json({
        dailyStats: [],
        overall: { avg: 0, min: 0, max: 0, trendStatus: "N/A" },
        explanation: "No data available",
      });
    }

    // Group by day
    const groups = {};
    rates.forEach((r) => {
      const d = r.time.toISOString().split("T")[0];
      groups[d] = groups[d] || [];
      groups[d].push(r.heartRate);
    });

    // Compute stats
    const dailyStats = Object.keys(groups)
      .sort()
      .map((dateStr) => {
        const vals = groups[dateStr].slice().sort((a, b) => a - b);
        const { min, q1, median, q3, max } = getBoxPlotStats(vals);
        return { date: dateStr, min, q1, median, q3, max };
      });

    const all = rates.map((r) => r.heartRate);
    const overallAvg = (all.reduce((a, b) => a + b, 0) / all.length).toFixed(1);
    const overallMin = Math.min(...all);
    const overallMax = Math.max(...all);
    const trendStatus =
      overallAvg >= 60 && overallAvg <= 100 ? "Okay" : "Not Okay";
    const explanation = `Data shown for the past week. Weekly avg: ${overallAvg} bpm (min ${overallMin}, max ${overallMax}).`;

    res.json({
      dailyStats,
      overall: {
        avg: overallAvg,
        min: overallMin,
        max: overallMax,
        trendStatus,
      },
      explanation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ——— Helpers ———
function getMedian(arr) {
  const len = arr.length;
  if (!len) return 0;
  if (len % 2 === 0) {
    return (arr[len / 2 - 1] + arr[len / 2]) / 2;
  }
  return arr[Math.floor(len / 2)];
}

function getBoxPlotStats(values) {
  if (!values.length) return { min: 0, q1: 0, median: 0, q3: 0, max: 0 };
  const sorted = [...values];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const median = getMedian(sorted);
  const mid = Math.floor(sorted.length / 2);
  const lower = sorted.slice(0, mid);
  const upper = sorted.slice(sorted.length % 2 ? mid + 1 : mid);
  const q1 = getMedian(lower);
  const q3 = getMedian(upper);
  return { min, q1, median, q3, max };
}

// ——— Start Server ———
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
