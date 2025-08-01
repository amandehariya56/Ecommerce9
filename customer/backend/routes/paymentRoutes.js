const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authenticateToken = require('../middleware/customerAuth');

// Create Razorpay order
router.post('/create-order', authenticateToken, paymentController.createOrder);

// Verify Razorpay payment
router.post('/verify', authenticateToken, paymentController.verifyPayment);

// Get payment details for an order
router.get('/order/:order_id', authenticateToken, paymentController.getPaymentDetails);

module.exports = router;