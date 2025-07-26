const db = require('../config/db');

class OrderModel {
  // Generate unique order number
  static generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD${timestamp}${random}`;
  }

  // Create new order
  static async createOrder(orderData) {
    try {
      const {
        customer_id,
        order_number,
        total_amount,
        payment_method,
        shipping_address,
        billing_address,
        notes
      } = orderData;

      const [result] = await db.query(
        `INSERT INTO orders (customer_id, order_number, total_amount, payment_method, 
         shipping_address, billing_address, notes, status, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
        [customer_id, order_number, total_amount, payment_method, 
         shipping_address, billing_address, notes]
      );

      return result.insertId;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Add order items
  static async addOrderItems(orderId, items) {
    try {
      const values = items.map(item => [
        orderId,
        item.product_id,
        item.product_name,
        item.product_price,
        item.quantity,
        item.total_price
      ]);

      await db.query(
        `INSERT INTO order_items (order_id, product_id, product_name, 
         product_price, quantity, total_price) VALUES ?`,
        [values]
      );

      return true;
    } catch (error) {
      console.error('Error adding order items:', error);
      throw error;
    }
  }

  // Update order status (FIXED - no history table)
  static async updateOrderStatus(orderId, status, message = null, adminId = null) {
    try {
      // Only update orders table - skip history table
      await db.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, orderId]
      );

      // COMMENTED OUT - TABLE DOESN'T EXIST
      // await db.query(
      //   'INSERT INTO order_status_history (order_id, status, message, created_by_admin_id) VALUES (?, ?, ?, ?)',
      //   [orderId, status, message, adminId]
      // );

      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Get orders for customer
  static async getOrdersByCustomer(customerId) {
    try {
      const [rows] = await db.query(`
        SELECT o.*, 
               COUNT(oi.id) as item_count,
               GROUP_CONCAT(oi.product_name SEPARATOR ', ') as product_names
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.customer_id = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `, [customerId]);
      
      return rows;
    } catch (error) {
      console.error('Error getting customer orders:', error);
      throw error;
    }
  }

  // Get order details
  static async getOrderDetails(orderId, customerId = null) {
    try {
      let query = `
        SELECT o.*, c.name as customer_name, c.email as customer_email
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id
        WHERE o.id = ?
      `;
      let params = [orderId];

      if (customerId) {
        query += ' AND o.customer_id = ?';
        params.push(customerId);
      }

      const [orderRows] = await db.query(query, params);
      
      if (orderRows.length === 0) {
        return null;
      }

      const order = orderRows[0];

      // Get order items
      const [itemRows] = await db.query(`
        SELECT oi.*, p.image_url
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [orderId]);

      order.items = itemRows;
      return order;
    } catch (error) {
      console.error('Error getting order details:', error);
      throw error;
    }
  }
}

module.exports = OrderModel;


