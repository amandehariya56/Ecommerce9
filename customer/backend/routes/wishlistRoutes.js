const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const customerAuth = require('../middleware/customerAuth');

// All wishlist routes require authentication
router.use(customerAuth);

// Add item to wishlist
router.post('/add', wishlistController.addToWishlist);

// Get wishlist items
router.get('/', wishlistController.getWishlist);

// Clear wishlist (must be before specific routes)
router.delete('/clear', wishlistController.clearWishlist);

// Check if item is in wishlist (must be before /:productId routes)
router.get('/check/:productId', wishlistController.checkWishlist);

// Remove item from wishlist
router.delete('/remove/:wishlistItemId', wishlistController.removeFromWishlist);

// Move item from wishlist to cart
router.post('/move-to-cart/:wishlistItemId', wishlistController.moveToCart);

module.exports = router; 