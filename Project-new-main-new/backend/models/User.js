const pool = require("../config/db");
const bcrypt = require("bcrypt");

class User {
  // Create users table if it doesn't exist
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    try {
      await pool.query(query);
      console.log("Users table created or already exists");
    } catch (err) {
      console.error("Error creating users table:", err);
    }
  }

  // Register a new user
  static async register(email, password, name) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const query = `
        INSERT INTO users (email, password, name)
        VALUES ($1, $2, $3)
        RETURNING id, email, name;
      `;

      const result = await pool.query(query, [email, hashedPassword, name]);
      return result.rows[0];
    } catch (err) {
      if (err.code === "23505") {
        throw new Error("Email already exists");
      }
      throw err;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const query = `SELECT * FROM users WHERE email = $1;`;
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const query = `SELECT id, email, name FROM users WHERE id = $1;`;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
