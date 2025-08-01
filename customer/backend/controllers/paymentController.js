const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/db');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
exports.createOrder = async (req, res) => {
  try {
    console.log('🔥 Payment request received:', req.body);
    console.log('🔍 Request body type:', typeof req.body);
    console.log('🔍 Amount:', req.body.amount, 'Type:', typeof req.body.amount);
    console.log('🔍 Order ID:', req.body.order_id, 'Type:', typeof req.body.order_id);
    
    // Check environment variables
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay keys missing in environment');
      return res.status(500).json({ 
        success: false, 
        message: 'Payment service not configured' 
      });
    }
    
    const { amount, order_id } = req.body;
    
    // Detailed validation
    if (!amount) {
      console.error('❌ Amount is missing:', amount);
      return res.status(400).json({ 
        success: false, 
        message: 'Amount is required' 
      });
    }
    
    if (!order_id) {
      console.error('❌ Order ID is missing:', order_id);
      return res.status(400).json({ 
        success: false, 
        message: 'Order ID is required' 
      });
    }
    
    // Validate amount is a positive number
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      console.error('❌ Invalid amount:', amount);
      return res.status(400).json({ 
        success: false, 
        message: 'Amount must be a positive number' 
      });
    }
    
    // Validate order_id is a positive integer
    const numOrderId = Number(order_id);
    if (isNaN(numOrderId) || numOrderId <= 0 || !Number.isInteger(numOrderId)) {
      console.error('❌ Invalid order ID:', order_id);
      return res.status(400).json({ 
        success: false, 
        message: 'Order ID must be a positive integer' 
      });
    }
    
    console.log('✅ Validation passed - Amount:', numAmount, 'Order ID:', numOrderId);

    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `order_${order_id}_${Date.now()}`,
      notes: {
        order_id: order_id
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Insert initial payment record
    await db.query(`
      INSERT INTO order_payments (
        order_id, payment_id, payment_method, amount, status, gateway_response
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      order_id,
      razorpayOrder.id,
      'razorpay',
      amount,
      'pending',
      JSON.stringify(razorpayOrder)
    ]);

    res.json({
      success: true,
      order: razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('❌ Payment creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment order', 
      error: error.message 
    });
  }
};

// Verify Razorpay payment
exports.verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      order_id 
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing payment verification data' 
      });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Get payment details from Razorpay
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      
      // Update payment record
      await db.query(`
        UPDATE order_payments 
        SET 
          status = 'success',
          transaction_id = ?,
          gateway_response = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE payment_id = ?
      `, [
        razorpay_payment_id,
        JSON.stringify(payment),
        razorpay_order_id
      ]);

      // Update order status
      await db.query(`
        UPDATE orders 
        SET status = 'confirmed', payment_status = 'paid'
        WHERE id = ?
      `, [order_id]);

      res.json({
        success: true,
        message: 'Payment verified successfully',
        payment_id: razorpay_payment_id
      });
    } else {
      // Update payment as failed
      await db.query(`
        UPDATE order_payments 
        SET 
          status = 'failed',
          gateway_response = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE payment_id = ?
      `, [
        JSON.stringify({ error: 'Invalid signature' }),
        razorpay_order_id
      ]);

      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    
    // Update payment as failed
    if (req.body.razorpay_order_id) {
      await db.query(`
        UPDATE order_payments 
        SET 
          status = 'failed',
          gateway_response = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE payment_id = ?
      `, [
        JSON.stringify({ error: error.message }),
        req.body.razorpay_order_id
      ]);
    }

    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

// Get payment details
exports.getPaymentDetails = async (req, res) => {
  try {
    const { order_id } = req.params;
    
    const [payments] = await db.query(`
      SELECT 
        op.*,
        o.total_amount as order_amount,
        o.status as order_status
      FROM order_payments op
      LEFT JOIN orders o ON op.order_id = o.id
      WHERE op.order_id = ?
      ORDER BY op.created_at DESC
    `, [order_id]);

    res.json({
      success: true,
      payments: payments
    });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message
    });
  }
}; 
