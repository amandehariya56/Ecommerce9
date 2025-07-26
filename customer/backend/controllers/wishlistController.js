const Wishlist = require('../models/wishlistModel');
const sendResponse = require('../utils/sendResponse');

const wishlistController = {
  // Add item to wishlist
  addToWishlist: async (req, res) => {
    try {
      const { productId } = req.body;
      const customerId = req.customer.id;

      if (!productId) {
        return sendResponse(res, 400, false, "Product ID is required");
      }

      const result = await Wishlist.addToWishlist(customerId, productId);
      
      if (result.success) {
        sendResponse(res, 200, true, result.message);
      } else {
        sendResponse(res, 400, false, result.message);
      }
    } catch (error) {
      console.error("Add to wishlist controller error:", error);
      sendResponse(res, 500, false, "Failed to add item to wishlist");
    }
  },

  // Get wishlist items
  getWishlist: async (req, res) => {
    try {
      const customerId = req.customer.id;
      const wishlistItems = await Wishlist.getWishlist(customerId);
      
      sendResponse(res, 200, true, "Wishlist retrieved successfully", {
        items: wishlistItems,
        totalItems: wishlistItems.length
      });
    } catch (error) {
      console.error("Get wishlist controller error:", error);
      sendResponse(res, 500, false, "Failed to get wishlist");
    }
  },

  // Remove item from wishlist
  removeFromWishlist: async (req, res) => {
    try {
      const { wishlistItemId } = req.params;
      const customerId = req.customer.id;

      const success = await Wishlist.removeFromWishlist(customerId, wishlistItemId);
      
      if (success) {
        sendResponse(res, 200, true, "Item removed from wishlist");
      } else {
        sendResponse(res, 404, false, "Item not found in wishlist");
      }
    } catch (error) {
      console.error("Remove from wishlist controller error:", error);
      sendResponse(res, 500, false, "Failed to remove item from wishlist");
    }
  },

  // Check if item is in wishlist
  checkWishlist: async (req, res) => {
    try {
      const { productId } = req.params;
      const customerId = req.customer.id;

      const isInWishlist = await Wishlist.isInWishlist(customerId, productId);
      
      sendResponse(res, 200, true, "Wishlist status checked", {
        isInWishlist
      });
    } catch (error) {
      console.error("Check wishlist controller error:", error);
      sendResponse(res, 500, false, "Failed to check wishlist status");
    }
  },

  // Move item from wishlist to cart
  moveToCart: async (req, res) => {
    try {
      const { wishlistItemId } = req.params;
      const customerId = req.customer.id;

      const result = await Wishlist.moveToCart(customerId, wishlistItemId);
      
      if (result.success) {
        sendResponse(res, 200, true, result.message);
      } else {
        sendResponse(res, 400, false, result.message);
      }
    } catch (error) {
      console.error("Move to cart controller error:", error);
      sendResponse(res, 500, false, "Failed to move item to cart");
    }
  },

  // Clear wishlist
  clearWishlist: async (req, res) => {
    try {
      const customerId = req.customer.id;
      await Wishlist.clearWishlist(customerId);
      sendResponse(res, 200, true, "Wishlist cleared successfully");
    } catch (error) {
      console.error("Clear wishlist controller error:", error);
      sendResponse(res, 500, false, "Failed to clear wishlist");
    }
  }
};

module.exports = wishlistController; 