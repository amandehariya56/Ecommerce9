const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const customerAuth = require('../middleware/customerAuth');

// All cart routes require authentication
router.use(customerAuth);

// Add item to cart
router.post('/add', cartController.addToCart);

// Get cart items
router.get('/', cartController.getCart);

// Remove item from cart
router.delete('/remove/:cartItemId', cartController.removeFromCart);

// Update cart item quantity
router.put('/update/:cartItemId', cartController.updateQuantity);

// Clear cart
router.delete('/clear', cartController.clearCart);

module.exports = router; 