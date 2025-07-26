const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const customerAuth = require('../middleware/customerAuth');
const { generalLimiter } = require('../middleware/rateLimiter');

// Apply authentication to all address routes
router.use(customerAuth);

// Apply rate limiting
router.use(generalLimiter);

// Address routes
router.get('/', addressController.getAddresses);
router.get('/default', addressController.getDefaultAddress);
router.get('/:addressId', addressController.getAddressById);
router.post('/', addressController.addAddress);
router.put('/:addressId', addressController.updateAddress);
router.delete('/:addressId', addressController.deleteAddress);
router.put('/:addressId/set-default', addressController.setDefaultAddress);

module.exports = router;
