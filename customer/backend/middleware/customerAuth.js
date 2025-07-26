const jwt = require("jsonwebtoken");
// const blacklistModel = require("../models/blacklistModel"); // Temporarily disabled

module.exports = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware called');
    console.log('Headers:', req.headers.authorization);

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('❌ No authorization header');
      return res.status(401).json({
        success: false,
        message: "Authorization token missing"
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log('❌ No token in header');
      return res.status(401).json({
        success: false,
        message: "Invalid token format"
      });
    }

    console.log('🔑 Token found, verifying...');

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified, customer:', decoded);

    req.customer = decoded;
    next();
  } catch (err) {
    console.error("❌ Auth middleware error:", err.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};
