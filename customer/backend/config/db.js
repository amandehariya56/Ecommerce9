const mysql = require("mysql2/promise");

let pool;

const initializeDatabase = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "12345",
      database: process.env.DB_NAME || "ecommerce9",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully!");
    connection.release();

  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

// Initialize database connection
initializeDatabase();

module.exports = {
  query: (...args) => pool.query(...args),
  pool,
};
