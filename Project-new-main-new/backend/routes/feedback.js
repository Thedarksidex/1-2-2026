const express = require("express");
const Feedback = require("../models/Feedback");

const router = express.Router();

// Middleware to verify JWT token (optional - for authenticated feedback)
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  
  if (token) {
    const jwt = require("jsonwebtoken");
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.id;
    } catch (err) {
      req.userId = null;
    }
  }
  next();
};

// Submit feedback
router.post("/submit", verifyToken, async (req, res) => {
  try {
    const { name, email, carModel, experience, rating } = req.body;

    // Validation
    if (!name || !carModel || !experience) {
      return res.status(400).json({ 
        error: "Name, car model, and experience are required" 
      });
    }

    if (!email || !email.includes("@")) {
      return res.status(400).json({ 
        error: "Valid email is required" 
      });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ 
        error: "Rating must be between 1 and 5" 
      });
    }

    // Submit feedback
    const feedback = await Feedback.submitFeedback(
      name,
      email,
      carModel,
      experience,
      rating || null,
      req.userId || null
    );

    res.status(201).json({
      message: "Feedback submitted successfully. Thank you for your review!",
      feedback: feedback
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while submitting feedback" });
  }
});

// Get all approved feedback (public)
router.get("/all", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    if (limit < 1 || limit > 100) {
      return res.status(400).json({ error: "Limit must be between 1 and 100" });
    }

    const feedbacks = await Feedback.getAllFeedback(limit, offset);
    const stats = await Feedback.getAverageRating();

    res.json({
      feedbacks: feedbacks,
      stats: stats,
      limit: limit,
      offset: offset
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching feedback" });
  }
});

// Get feedback count (public)
router.get("/count", async (req, res) => {
  try {
    const count = await Feedback.getFeedbackCount();
    const stats = await Feedback.getAverageRating();

    res.json({
      totalFeedback: count,
      averageRating: stats.averageRating
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Get user's feedback (protected)
router.get("/my-feedback", verifyToken, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "You must be logged in" });
    }

    const feedbacks = await Feedback.getUserFeedback(req.userId);

    res.json({
      feedbacks: feedbacks,
      count: feedbacks.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Get feedback by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Invalid feedback ID" });
    }

    const feedback = await Feedback.getFeedbackById(id);

    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    if (feedback.status !== "approved") {
      return res.status(404).json({ error: "Feedback not found" });
    }

    res.json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Delete user's feedback (protected)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "You must be logged in" });
    }

    const { id } = req.params;
    const feedback = await Feedback.getFeedbackById(id);

    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    if (feedback.user_id !== req.userId) {
      return res.status(403).json({ error: "You can only delete your own feedback" });
    }

    await Feedback.deleteFeedback(id);

    res.json({ message: "Feedback deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Admin: Get all feedback (including pending)
router.get("/admin/all-feedback", verifyToken, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Note: In production, check if user is admin
    // This is a basic example

    const query = `
      SELECT id, name, email, car_model, experience, rating, status, created_at
      FROM feedback
      ORDER BY created_at DESC;
    `;

    const pool = require("../config/db");
    const result = await pool.query(query);

    res.json({ feedbacks: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Admin: Update feedback status
router.patch("/admin/:id/status", verifyToken, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const feedback = await Feedback.updateFeedbackStatus(id, status);

    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    res.json({
      message: `Feedback ${status} successfully`,
      feedback: feedback
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
