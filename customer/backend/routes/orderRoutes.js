const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const customerAuth = require('../middleware/customerAuth');
const { generalLimiter } = require('../middleware/rateLimiter');

router.use(customerAuth);
router.use(generalLimiter);

router.post('/place', orderController.placeOrder);
router.get('/', orderController.getOrders);
router.get('/:orderId', orderController.getOrderById);
router.put('/:orderId/cancel', orderController.cancelOrder);
router.get('/:orderId/history', orderController.getOrderHistory);
router.post('/place-from-cart', orderController.placeOrderFromCart);

module.exports = router;
