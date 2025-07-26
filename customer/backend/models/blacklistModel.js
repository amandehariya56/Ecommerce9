const db = require("../config/db");

exports.blacklistToken = async (token, expiresAt) => {
  return db.query(
    "INSERT INTO blacklisted_tokens (token, expires_at) VALUES (?, ?)",
    [token, expiresAt]
  );
};

exports.isTokenBlacklisted = async (token) => {
  const [rows] = await db.query(
    "SELECT * FROM blacklisted_tokens WHERE token = ?",
    [token]
  );
  return rows.length > 0;
};
