const pool = require("../config/db");

class Feedback {
  // Drop existing feedback table (for development)
  static async dropTable() {
    const query = `DROP TABLE IF EXISTS feedback CASCADE;`;
    try {
      await pool.query(query);
      console.log("Feedback table dropped");
    } catch (err) {
      console.error("Error dropping feedback table:", err);
    }
  }

  // Create feedback table if it doesn't exist
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        car_model VARCHAR(255) NOT NULL,
        experience TEXT NOT NULL,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    try {
      await pool.query(query);
      console.log("Feedback table created or already exists");
    } catch (err) {
      console.error("Error creating feedback table:", err);
    }
  }

  // Submit new feedback
  static async submitFeedback(name, email, carModel, experience, rating, userId = null) {
    try {
      const query = `
        INSERT INTO feedback (name, email, car_model, experience, rating, user_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, car_model, experience, rating, created_at;
      `;

      const result = await pool.query(query, [name, email, carModel, experience, rating, userId]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  // Get all feedback
  static async getAllFeedback(limit = 10, offset = 0) {
    try {
      const query = `
        SELECT id, name, email, car_model, experience, rating, created_at
        FROM feedback
        WHERE status = 'approved'
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2;
      `;

      const result = await pool.query(query, [limit, offset]);
      return result.rows;
    } catch (err) {
      throw err;
    }
  }

  // Get feedback count
  static async getFeedbackCount() {
    try {
      const query = `SELECT COUNT(*) as count FROM feedback WHERE status = 'approved';`;
      const result = await pool.query(query);
      return result.rows[0].count;
    } catch (err) {
      throw err;
    }
  }

  // Get user's feedback
  static async getUserFeedback(userId) {
    try {
      const query = `
        SELECT id, name, email, car_model, experience, rating, status, created_at
        FROM feedback
        WHERE user_id = $1
        ORDER BY created_at DESC;
      `;

      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (err) {
      throw err;
    }
  }

  // Get feedback by ID
  static async getFeedbackById(id) {
    try {
      const query = `
        SELECT * FROM feedback
        WHERE id = $1;
      `;

      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  // Update feedback status (for admin)
  static async updateFeedbackStatus(id, status) {
    try {
      const query = `
        UPDATE feedback
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *;
      `;

      const result = await pool.query(query, [status, id]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  // Delete feedback
  static async deleteFeedback(id) {
    try {
      const query = `DELETE FROM feedback WHERE id = $1 RETURNING id;`;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  // Get average rating
  static async getAverageRating() {
    try {
      const query = `
        SELECT AVG(rating) as average_rating, COUNT(*) as total_feedback
        FROM feedback
        WHERE status = 'approved';
      `;

      const result = await pool.query(query);
      return {
        averageRating: parseFloat(result.rows[0].average_rating || 0).toFixed(2),
        totalFeedback: result.rows[0].total_feedback || 0
      };
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Feedback;
