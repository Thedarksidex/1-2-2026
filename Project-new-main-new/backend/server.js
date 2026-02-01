const express = require("express");
const cors = require("cors");
const app = express();
const pool = require("./config/db");
const authRoutes = require("./routes/auth");
const feedbackRoutes = require("./routes/feedback");
const User = require("./models/User");
const Feedback = require("./models/Feedback");

// Middleware
app.use(express.json());
app.use(cors());

// Initialize database tables
User.createTable();

// Recreate feedback table with correct defaults
async function initializeFeedbackTable() {
  try {
    await Feedback.dropTable();
    await Feedback.createTable();
    
    // Also ensure any pending feedback is marked as approved
    await pool.query(`UPDATE feedback SET status = 'approved' WHERE status = 'pending';`);
    
    console.log("Feedback table initialized with approved default");
  } catch (err) {
    console.error("Error initializing feedback table:", err);
  }
}

// Wait for feedback table to initialize before starting server
initializeFeedbackTable();

// Routes
app.get("/", (req, res) => {
  res.send("Server + PostgreSQL connected");
});

// Auth routes
app.use("/api/auth", authRoutes);

// Feedback routes
app.use("/api/feedback", feedbackRoutes);

const server = app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
