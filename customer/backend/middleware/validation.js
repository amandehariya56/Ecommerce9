const validator = require('validator');

// Validation middleware
const validateRegistration = (req, res, next) => {
  const { name, email, phone, password } = req.body;
  const errors = [];

  // Name validation
  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  if (name && name.length > 50) {
    errors.push('Name must be less than 50 characters');
  }

  // Email validation
  if (!email || !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  // Phone validation
  if (!phone || !validator.isMobilePhone(phone, 'any')) {
    errors.push('Please provide a valid phone number');
  }

  // Password validation
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  if (password && password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Email validation
  if (!email || !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (!password || password.trim().length === 0) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateOTP = (req, res, next) => {
  const { phone, otp } = req.body;
  const errors = [];

  // Phone validation
  if (!phone || !validator.isMobilePhone(phone, 'any')) {
    errors.push('Please provide a valid phone number');
  }

  // OTP validation
  if (!otp || !/^\d{6}$/.test(otp)) {
    errors.push('OTP must be a 6-digit number');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateResetPassword = (req, res, next) => {
  const { phone, otp, newPassword } = req.body;
  const errors = [];

  // Phone validation
  if (!phone || !validator.isMobilePhone(phone, 'any')) {
    errors.push('Please provide a valid phone number');
  }

  // OTP validation
  if (!otp || !/^\d{6}$/.test(otp)) {
    errors.push('OTP must be a 6-digit number');
  }

  // Password validation
  if (!newPassword || newPassword.length < 6) {
    errors.push('New password must be at least 6 characters long');
  }
  if (newPassword && newPassword.length > 128) {
    errors.push('New password must be less than 128 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateCartItem = (req, res, next) => {
  const { productId, quantity } = req.body;
  const errors = [];

  // Product ID validation
  if (!productId || !Number.isInteger(Number(productId)) || Number(productId) <= 0) {
    errors.push('Valid product ID is required');
  }

  // Quantity validation
  if (quantity !== undefined) {
    if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
      errors.push('Quantity must be a positive integer');
    }
    if (Number(quantity) > 100) {
      errors.push('Quantity cannot exceed 100');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateOrder = (req, res, next) => {
  const { productId, quantity } = req.body;
  const errors = [];

  // Product ID validation
  if (!productId || !Number.isInteger(Number(productId)) || Number(productId) <= 0) {
    errors.push('Valid product ID is required');
  }

  // Quantity validation
  if (!quantity || !Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
    errors.push('Quantity must be a positive integer');
  }
  if (Number(quantity) > 100) {
    errors.push('Quantity cannot exceed 100');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Sanitize input middleware
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = validator.escape(req.body[key].trim());
      }
    });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateOTP,
  validateResetPassword,
  validateCartItem,
  validateOrder,
  sanitizeInput
};
