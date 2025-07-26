const twilio = require('twilio');
const nodemailer = require('nodemailer');

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// In-memory storage for OTP data (in production, use Redis or database)
const otpStorage = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via SMS (Twilio) and Email (Nodemailer)
const sendOTP = async (phoneNumber, otp, email) => {
  let smsSent = false;
  let emailSent = false;
  let smsError = null;
  let emailError = null;

  // Send SMS
  try {
    console.log('Twilio sending to:', phoneNumber, 'OTP:', otp);
    await twilioClient.messages.create({
      body: `Your OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    smsSent = true;
    console.log('Twilio SMS sent successfully');
  } catch (err) {
    console.error('Twilio error:', err, err?.stack);
    smsError = err.message;
  }

  // Send Email
  try {
    console.log('Nodemailer sending to:', email, 'OTP:', otp);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp}`,
    });
    emailSent = true;
    console.log('Nodemailer email sent successfully');
  } catch (err) {
    console.error('Nodemailer error:', err, err?.stack);
    emailError = err.message;
  }

  return { smsSent, emailSent, smsError, emailError };
};

// Store OTP data temporarily
const storeOTPData = (phoneNumber, otp, customerData) => {
  const expiryTime = Date.now() + (5 * 60 * 1000); // 5 minutes
  otpStorage.set(phoneNumber, {
    otp,
    customerData,
    expiryTime,
    attempts: 0
  });
  // Clean up expired OTPs
  setTimeout(() => {
    if (otpStorage.has(phoneNumber)) {
      const storedData = otpStorage.get(phoneNumber);
      if (Date.now() > storedData.expiryTime) {
        otpStorage.delete(phoneNumber);
      }
    }
  }, 5 * 60 * 1000);
};

// Verify OTP
const verifyOTP = (phoneNumber, inputOTP) => {
  const storedData = otpStorage.get(phoneNumber);
  if (!storedData) {
    return { valid: false, message: 'OTP expired or not found' };
  }
  if (Date.now() > storedData.expiryTime) {
    otpStorage.delete(phoneNumber);
    return { valid: false, message: 'OTP has expired' };
  }
  if (storedData.attempts >= 3) {
    otpStorage.delete(phoneNumber);
    return { valid: false, message: 'Too many attempts. Please request new OTP' };
  }
  storedData.attempts++;
  if (storedData.otp === inputOTP) {
    const customerData = storedData.customerData;
    otpStorage.delete(phoneNumber);
    return { valid: true, customerData };
  }
  return { valid: false, message: 'Invalid OTP' };
};

// Get stored customer data
const getStoredCustomerData = (phoneNumber) => {
  const storedData = otpStorage.get(phoneNumber);
  return storedData ? storedData.customerData : null;
};

module.exports = {
  generateOTP,
  sendOTP,
  storeOTPData,
  verifyOTP,
  getStoredCustomerData
}; 