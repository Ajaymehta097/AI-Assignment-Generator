// server.js
require("dotenv").config();
const express    = require("express");
const cors       = require("cors");
const { initDB } = require("./config/db");
const assignmentRoutes = require("./routes/assignment");
const authRoutes       = require("./routes/auth");

const app  = express();
const PORT = process.env.PORT || 5000;
// Add your live Vercel URL to this list
const allowedOrigins = [
  'http://localhost:3000', 
  'https://ai-assignment-generator-iota.vercel.app' 
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", assignmentRoutes);

app.get("/", (req, res) => res.json({ status: "running" }));

app.use((err, req, res, next) => {
  console.error("[Server Error]", err.message);
  res.status(500).json({ success: false, error: err.message });
});

// Init DB then start server
initDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      if (!process.env.HF_API_TOKEN) console.warn("⚠️  HF_API_TOKEN not set!");
      else console.log("✅ HF_API_TOKEN loaded");
    });
  })
  .catch((err) => {
    console.error("❌ MySQL connection failed:", err.message);
    console.error("Check your DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in .env");
    process.exit(1);
  });