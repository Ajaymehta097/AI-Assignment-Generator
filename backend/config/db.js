// config/db.js
const mysql = require("mysql2/promise");
require("dotenv").config();
const pool = process.env.MYSQL_URL
  ? mysql.createPool(process.env.MYSQL_URL)
  : mysql.createPool({
      host:     process.env.DB_HOST     || "localhost",
      port:     process.env.DB_PORT     || 3306,
      user:     process.env.DB_USER     || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME     || "assignment_generator",
      waitForConnections: true,
      connectionLimit: 10,
    });

async function initDB() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        full_name     VARCHAR(100)  NOT NULL,
        email         VARCHAR(100)  NOT NULL UNIQUE,
        enrollment_no VARCHAR(50)   NOT NULL,
        password_hash VARCHAR(255)  NOT NULL,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        user_id       INT          NOT NULL,
        subject_name  VARCHAR(200),
        file_name     VARCHAR(255),
        output_format VARCHAR(10),
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ MySQL tables ready");
  } finally {
    conn.release();
  }
}

module.exports = { pool, initDB };