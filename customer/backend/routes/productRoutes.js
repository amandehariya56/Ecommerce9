const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { generalLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting to all product routes
router.use(generalLimiter);

// Get all products with pagination and filters
router.get('/', productController.getAllProducts);

// Search products (must be before /:id route)
router.get('/search/:query', productController.searchProducts);

// Get featured products (must be before /:id route)
router.get('/featured/list', productController.getFeaturedProducts);

// Get categories (must be before /:id route)
router.get('/categories/all', productController.getCategories);

// Get all subcategories (must be before /:id route)
router.get('/subcategories/all', productController.getAllSubcategories);

// Get subcategories by category (must be before /:id route)
router.get('/categories/:categoryId/subcategories', productController.getSubcategories);

// Get products by category (must be before /:id route)
router.get('/category/:categoryId', productController.getProductsByCategory);

// Get products by subcategory (must be before /:id route)
router.get('/subcategory/:subcategoryId', productController.getProductsBySubcategory);

// Get product by ID (must be after specific routes)
router.get('/:id', productController.getProductById);

// Get product reviews (must be after /:id route)
router.get('/:id/reviews', productController.getProductReviews);

// Get related products (must be after /:id route)
router.get('/:id/related', productController.getRelatedProducts);

module.exports = router;
