const db = require("../config/db");

const Wishlist = {
  // Add item to wishlist
  addToWishlist: async (customerId, productId) => {
    try {
      // Check if item already exists in wishlist
      const [existing] = await db.query(
        "SELECT * FROM wishlist WHERE customer_id = ? AND product_id = ?",
        [customerId, productId]
      );

      if (existing.length > 0) {
        return { success: false, message: "Item already in wishlist" };
      }

      // Add new item to wishlist
      await db.query(
        "INSERT INTO wishlist (customer_id, product_id) VALUES (?, ?)",
        [customerId, productId]
      );
      return { success: true, message: "Added to wishlist" };
    } catch (error) {
      console.error("Add to wishlist error:", error);
      throw error;
    }
  },

  // Get wishlist items for a customer
  getWishlist: async (customerId) => {
    try {
      const [rows] = await db.query(`
        SELECT 
          w.id,
          w.added_at,
          p.id as product_id,
          p.name,
          p.price,
          p.images,
          p.quantity as stock_quantity,
          p.description
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        WHERE w.customer_id = ?
        ORDER BY w.added_at DESC
      `, [customerId]);

      return rows.map(item => ({
        ...item,
        images: item.images ? JSON.parse(item.images) : []
      }));
    } catch (error) {
      console.error("Get wishlist error:", error);
      throw error;
    }
  },

  // Remove item from wishlist
  removeFromWishlist: async (customerId, wishlistItemId) => {
    try {
      const [result] = await db.query(
        "DELETE FROM wishlist WHERE id = ? AND customer_id = ?",
        [wishlistItemId, customerId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Remove from wishlist error:", error);
      throw error;
    }
  },

  // Check if item is in wishlist
  isInWishlist: async (customerId, productId) => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM wishlist WHERE customer_id = ? AND product_id = ?",
        [customerId, productId]
      );
      return rows.length > 0;
    } catch (error) {
      console.error("Check wishlist error:", error);
      throw error;
    }
  },

  // Move item from wishlist to cart
  moveToCart: async (customerId, wishlistItemId) => {
    try {
      // Get product details from wishlist
      const [wishlistItem] = await db.query(`
        SELECT w.product_id, p.name, p.price
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        WHERE w.id = ? AND w.customer_id = ?
      `, [wishlistItemId, customerId]);

      if (wishlistItem.length === 0) {
        return { success: false, message: "Item not found in wishlist" };
      }

      // Add to cart
      const Cart = require('./cartModel');
      await Cart.addToCart(customerId, wishlistItem[0].product_id, 1);

      // Remove from wishlist
      await Wishlist.removeFromWishlist(customerId, wishlistItemId);

      return { success: true, message: "Moved to cart" };
    } catch (error) {
      console.error("Move to cart error:", error);
      throw error;
    }
  },

  // Clear wishlist for a customer
  clearWishlist: async (customerId) => {
    try {
      await db.query("DELETE FROM wishlist WHERE customer_id = ?", [customerId]);
      return true;
    } catch (error) {
      console.error("Clear wishlist error:", error);
      throw error;
    }
  }
};

module.exports = Wishlist; 