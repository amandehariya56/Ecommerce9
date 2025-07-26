// routes/customerRoutes.js
const express = require("express");
const router = express.Router();
const {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  refreshAccessToken,
  sendRegistrationOTP,
  verifyOTPAndRegister,
  resendOTP,
  requestResetOTP,
  verifyResetOTP,
  resetPassword,
  getProfile,
  updateProfile
} = require("../controllers/customerController");

// Import middleware
const {
  validateRegistration,
  validateLogin,
  validateOTP,
  validateResetPassword,
  sanitizeInput
} = require("../middleware/validation");
const { authLimiter, otpLimiter } = require("../middleware/rateLimiter");
const customerAuth = require("../middleware/customerAuth");

// Apply sanitization to all routes
router.use(sanitizeInput);

// OTP verification routes (with reasonable rate limiting)
router.post("/send-otp", otpLimiter, validateRegistration, sendRegistrationOTP);
router.post("/verify-otp", otpLimiter, validateOTP, verifyOTPAndRegister);
router.post("/resend-otp", otpLimiter, resendOTP);

// Reset password routes (with reasonable rate limiting)
router.post("/request-reset-otp", otpLimiter, requestResetOTP);
router.post("/verify-reset-otp", otpLimiter, verifyResetOTP);
router.post("/reset-password", authLimiter, validateResetPassword, resetPassword);

// Regular auth routes (with reasonable auth rate limiting)
router.post("/register", authLimiter, validateRegistration, registerCustomer);
router.post("/login", authLimiter, validateLogin, loginCustomer);
router.post("/logout", customerAuth, logoutCustomer);
router.post("/refresh", refreshAccessToken);

// Profile routes (protected)
router.get("/profile", customerAuth, getProfile);
router.put("/profile", customerAuth, updateProfile);

module.exports = router;




