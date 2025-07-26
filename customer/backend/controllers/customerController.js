const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { blacklistToken, isTokenBlacklisted } = require("../models/blacklistModel");
const { generateOTP, sendOTP, storeOTPData, verifyOTP } = require("../utils/otpUtils");

// REGISTER
exports.registerCustomer = async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO customers (name, email, phone, password) VALUES (?, ?, ?, ?)",
      [name, email, phone, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customerId: result.insertId,
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
};

// LOGIN (Access + Refresh Tokens)
exports.loginCustomer = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM customers WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      customer: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// LOGOUT (Blacklist Tokens)
exports.logoutCustomer = async (req, res) => {
  const { accessToken, refreshToken } = req.body;

  try {
    const decodedAccess = jwt.verify(accessToken, process.env.JWT_SECRET);
    const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    await blacklistToken(accessToken, new Date(decodedAccess.exp * 1000));
    await blacklistToken(refreshToken, new Date(decodedRefresh.exp * 1000));

    res.status(200).json({
      success: true,
      message: "Logout successful, tokens blacklisted",
    });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(400).json({ success: false, message: "Logout failed" });
  }
};

// REFRESH ACCESS TOKEN
exports.refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ success: false, message: "Missing refresh token" });

  try {
    const isBlacklisted = await isTokenBlacklisted(refreshToken);
    if (isBlacklisted) return res.status(403).json({ success: false, message: "Refresh token is blacklisted" });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({
      success: true,
      message: "New access token generated",
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh error:", error.message);
    res.status(403).json({ success: false, message: "Invalid or expired refresh token" });
  }
};

// SEND OTP FOR REGISTRATION
exports.sendRegistrationOTP = async (req, res) => {
  console.log("sendRegistrationOTP endpoint hit", req.body);
  const { name, email, phone, password } = req.body;
  try {
    // Check if customer already exists
    const [existingCustomer] = await db.query(
      "SELECT * FROM customers WHERE email = ? OR phone = ?",
      [email, phone]
    );
    if (existingCustomer.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Customer with this email or phone already exists"
      });
    }
    // Generate OTP
    const otp = generateOTP();
    // Store customer data temporarily with OTP
    const customerData = { name, email, phone, password };
    storeOTPData(phone, otp, customerData);
    // Format phone number for Twilio
    let formattedPhone = phone;
    if (!phone.startsWith('+')) {
      formattedPhone = '+91' + phone;
    }
    // Send OTP via SMS and Email
    const { smsSent, emailSent, smsError, emailError } = await sendOTP(formattedPhone, otp, email);
    if (!smsSent && !emailSent) {
      return res.status(500).json({
        success: false,
        message: `Failed to send OTP. SMS: ${smsError}, Email: ${emailError}`
      });
    }
    res.status(200).json({
      success: true,
      message: `OTP sent successfully to your phone and email`,
      phone: phone,
      email: email
    });
  } catch (error) {
    console.error("Send OTP error:", error, error?.stack);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

// VERIFY OTP AND REGISTER CUSTOMER
exports.verifyOTPAndRegister = async (req, res) => {
  const { phone, otp } = req.body;
  
  try {
    // Verify OTP
    const verificationResult = verifyOTP(phone, otp);
    
    if (!verificationResult.valid) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message
      });
    }
    
    // OTP is valid, get customer data and register
    const { customerData } = verificationResult;
    const { name, email, phone: customerPhone, password } = customerData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert customer into database
    const [result] = await db.query(
      "INSERT INTO customers (name, email, phone, password) VALUES (?, ?, ?, ?)",
      [name, email, customerPhone, hashedPassword]
    );
    
    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customerId: result.insertId,
    });
    
  } catch (error) {
    console.error("OTP verification and registration error:", error.message);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
};

// RESEND OTP
exports.resendOTP = async (req, res) => {
  const { phone } = req.body;
  try {
    // Check if customer already exists
    const [existingCustomer] = await db.query(
      "SELECT * FROM customers WHERE phone = ?",
      [phone]
    );
    if (existingCustomer.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Customer with this phone number already exists"
      });
    }
    // Generate new OTP
    const otp = generateOTP();
    // Get stored customer data
    const { getStoredCustomerData } = require("../utils/otpUtils");
    const customerData = getStoredCustomerData(phone);
    if (!customerData) {
      return res.status(400).json({
        success: false,
        message: "No pending registration found for this phone number"
      });
    }
    // Store new OTP
    storeOTPData(phone, otp, customerData);
    // Format phone number for Twilio
    let formattedPhone = phone;
    if (!phone.startsWith('+')) {
      formattedPhone = '+91' + phone;
    }
    // Send new OTP via SMS and Email
    const { smsSent, emailSent, smsError, emailError } = await sendOTP(formattedPhone, otp, customerData.email);
    if (!smsSent && !emailSent) {
      return res.status(500).json({
        success: false,
        message: `Failed to resend OTP. SMS: ${smsError}, Email: ${emailError}`
      });
    }
    res.status(200).json({
      success: true,
      message: "New OTP sent successfully to your phone and email",
      phone: phone,
      email: customerData.email
    });
  } catch (error) {
    console.error("Resend OTP error:", error, error?.stack);
    res.status(500).json({ success: false, message: "Failed to resend OTP" });
  }
};

// REQUEST RESET PASSWORD OTP
exports.requestResetOTP = async (req, res) => {
  const { phone, email } = req.body;
  try {
    // Find customer by phone or email
    const [rows] = await db.query(
      "SELECT * FROM customers WHERE phone = ? OR email = ?",
      [phone, email]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    const customer = rows[0];
    // Generate OTP
    const otp = generateOTP();
    // Store OTP with customer id for reset
    storeOTPData(customer.phone, otp, { id: customer.id, email: customer.email, phone: customer.phone });
    // Send OTP via SMS and Email
    const { smsSent, emailSent, smsError, emailError } = await sendOTP(customer.phone, otp, customer.email);
    if (!smsSent && !emailSent) {
      return res.status(500).json({ success: false, message: `Failed to send OTP. SMS: ${smsError}, Email: ${emailError}` });
    }
    res.status(200).json({ success: true, message: "OTP sent for password reset", phone: customer.phone, email: customer.email });
  } catch (error) {
    console.error("Request reset OTP error:", error.message);
    res.status(500).json({ success: false, message: "Failed to send reset OTP" });
  }
};

// VERIFY RESET PASSWORD OTP
exports.verifyResetOTP = async (req, res) => {
  const { phone, otp } = req.body;
  try {
    const verificationResult = verifyOTP(phone, otp);
    if (!verificationResult.valid) {
      return res.status(400).json({ success: false, message: verificationResult.message });
    }
    // OTP valid, allow password reset
    res.status(200).json({ success: true, message: "OTP verified. You can now reset your password.", phone });
  } catch (error) {
    console.error("Verify reset OTP error:", error.message);
    res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const { phone, newPassword } = req.body;
  try {
    // For security, check if OTP was verified recently (customerData should exist in memory)
    // (In production, use a more robust mechanism)
    // We'll just check if customerData exists for this phone
    const { getStoredCustomerData } = require("../utils/otpUtils");
    const customerData = getStoredCustomerData(phone);
    if (!customerData) {
      return res.status(400).json({ success: false, message: "OTP verification required or expired." });
    }
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Update password in DB
    await db.query("UPDATE customers SET password = ? WHERE phone = ?", [hashedPassword, phone]);
    // Remove OTP data
    storeOTPData(phone, null, null); // clear
    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error.message);
    res.status(500).json({ success: false, message: "Failed to reset password" });
  }
};

// GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const customerId = req.customer.id;

    const [customers] = await db.query(
      "SELECT id, name, email, phone, created_at FROM customers WHERE id = ?",
      [customerId]
    );

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    res.json({
      success: true,
      data: customers[0]
    });
  } catch (error) {
    console.error("Get profile error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile"
    });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const customerId = req.customer.id;
    const { name, email } = req.body;

    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters long"
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    // Check if email is already taken by another customer
    const [existingCustomer] = await db.query(
      "SELECT id FROM customers WHERE email = ? AND id != ?",
      [email, customerId]
    );

    if (existingCustomer.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered with another account"
      });
    }

    // Update profile
    await db.query(
      "UPDATE customers SET name = ?, email = ? WHERE id = ?",
      [name.trim(), email.trim(), customerId]
    );

    // Get updated profile
    const [updatedCustomer] = await db.query(
      "SELECT id, name, email, phone, created_at FROM customers WHERE id = ?",
      [customerId]
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedCustomer[0]
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update profile"
    });
  }
};
