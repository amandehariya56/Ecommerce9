const Cart = require('../models/cartModel');
const sendResponse = require('../utils/sendResponse');

const cartController = {
  // Add item to cart
  addToCart: async (req, res) => {
    try {
      const { productId, quantity = 1 } = req.body;
      const customerId = req.customer.id;

      if (!productId) {
        return sendResponse(res, 400, false, "Product ID is required");
      }

      const result = await Cart.addToCart(customerId, productId, quantity);
      sendResponse(res, 200, true, result.message, result);
    } catch (error) {
      console.error("Add to cart controller error:", error);
      sendResponse(res, 500, false, "Failed to add item to cart");
    }
  },

  // Get cart items
  getCart: async (req, res) => {
    try {
      const customerId = req.customer.id;
      const cartItems = await Cart.getCart(customerId);
      
      const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = cartItems.reduce((sum, item) => sum + item.total_price, 0);

      sendResponse(res, 200, true, "Cart retrieved successfully", {
        items: cartItems,
        totalItems,
        totalPrice
      });
    } catch (error) {
      console.error("Get cart controller error:", error);
      sendResponse(res, 500, false, "Failed to get cart");
    }
  },

  // Remove item from cart
  removeFromCart: async (req, res) => {
    try {
      const { cartItemId } = req.params;
      const customerId = req.customer.id;

      const success = await Cart.removeFromCart(customerId, cartItemId);
      
      if (success) {
        sendResponse(res, 200, true, "Item removed from cart");
      } else {
        sendResponse(res, 404, false, "Item not found in cart");
      }
    } catch (error) {
      console.error("Remove from cart controller error:", error);
      sendResponse(res, 500, false, "Failed to remove item from cart");
    }
  },

  // Update cart item quantity
  updateQuantity: async (req, res) => {
    try {
      const { cartItemId } = req.params;
      const { quantity } = req.body;
      const customerId = req.customer.id;

      if (quantity === undefined || quantity < 0) {
        return sendResponse(res, 400, false, "Valid quantity is required");
      }

      const success = await Cart.updateQuantity(customerId, cartItemId, quantity);
      
      if (success) {
        sendResponse(res, 200, true, "Cart updated successfully");
      } else {
        sendResponse(res, 404, false, "Item not found in cart");
      }
    } catch (error) {
      console.error("Update cart quantity controller error:", error);
      sendResponse(res, 500, false, "Failed to update cart");
    }
  },

  // Clear cart
  clearCart: async (req, res) => {
    try {
      const customerId = req.customer.id;
      await Cart.clearCart(customerId);
      sendResponse(res, 200, true, "Cart cleared successfully");
    } catch (error) {
      console.error("Clear cart controller error:", error);
      sendResponse(res, 500, false, "Failed to clear cart");
    }
  }
};

module.exports = cartController; 