const db = require('../config/db');

class Cart {
  // Add item to cart
  static async addToCart(customerId, productId, quantity = 1) {
    try {
      console.log('🛒 Adding to cart:', { customerId, productId, quantity });
      
      // Check if item already exists in cart
      const [existing] = await db.query(
        'SELECT * FROM cart WHERE customer_id = ? AND product_id = ?',
        [customerId, productId]
      );

      if (existing.length > 0) {
        // Update quantity if item exists
        await db.query(
          'UPDATE cart SET quantity = quantity + ? WHERE customer_id = ? AND product_id = ?',
          [quantity, customerId, productId]
        );
        console.log('✅ Cart updated successfully');
        return { message: 'Cart updated successfully' };
      } else {
        // Add new item to cart
        await db.query(
          'INSERT INTO cart (customer_id, product_id, quantity) VALUES (?, ?, ?)',
          [customerId, productId, quantity]
        );
        console.log('✅ Item added to cart successfully');
        return { message: 'Item added to cart successfully' };
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      throw error;
    }
  }

  // Get cart items
  static async getCart(customerId) {
    try {
      const [rows] = await db.query(`
        SELECT c.id, c.customer_id, c.product_id, c.quantity,
               p.name, p.price, p.images as image_url,
               (p.price * c.quantity) as total_price
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.customer_id = ?
      `, [customerId]);
      
      return rows;
    } catch (error) {
      console.error('Error getting cart:', error);
      throw error;
    }
  }

  // Remove item from cart
  static async removeFromCart(customerId, cartItemId) {
    try {
      const [result] = await db.query(
        'DELETE FROM cart WHERE id = ? AND customer_id = ?',
        [cartItemId, customerId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  // Update quantity
  static async updateQuantity(customerId, cartItemId, quantity) {
    try {
      if (quantity <= 0) {
        return await this.removeFromCart(customerId, cartItemId);
      }
      
      const [result] = await db.query(
        'UPDATE cart SET quantity = ? WHERE id = ? AND customer_id = ?',
        [quantity, cartItemId, customerId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  }

  // Clear cart
  static async clearCart(customerId) {
    try {
      await db.query('DELETE FROM cart WHERE customer_id = ?', [customerId]);
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
}

module.exports = Cart; 
