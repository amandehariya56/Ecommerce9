const OrderModel = require('../models/orderModel');
const Cart = require('../models/cartModel');
const sendResponse = require('../utils/sendResponse');

const orderController = {
  // Place order from cart
  placeOrder: async (req, res) => {
    try {
      console.log('📦 Place order request received');
      const customerId = req.customer.id;
      const {
        payment_method = 'cod',
        shipping_address,
        billing_address,
        notes
      } = req.body;

      console.log('📦 Order data:', { customerId, payment_method, shipping_address });

      if (!shipping_address) {
        return sendResponse(res, 400, false, "Shipping address is required");
      }

      // Get cart items
      const cartItems = await Cart.getCart(customerId);
      console.log('🛒 Cart items:', cartItems);

      if (!cartItems || cartItems.length === 0) {
        return sendResponse(res, 400, false, "Cart is empty");
      }

      // Calculate total amount
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      console.log('💰 Total amount:', totalAmount);

      // Generate order number
      const orderNumber = OrderModel.generateOrderNumber();
      console.log('🔢 Order number:', orderNumber);

      // Create order
      const orderId = await OrderModel.createOrder({
        customer_id: customerId,
        order_number: orderNumber,
        total_amount: totalAmount,
        payment_method,
        shipping_address,
        billing_address: billing_address || shipping_address,
        notes
      });

      console.log('✅ Order created with ID:', orderId);

      // Prepare order items
      const orderItems = cartItems.map(item => ({
        product_id: item.product_id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        total_price: item.price * item.quantity
      }));

      // Add order items
      await OrderModel.addOrderItems(orderId, orderItems);
      console.log('✅ Order items added');

      // Clear cart after successful order
      await Cart.clearCart(customerId);
      console.log('✅ Cart cleared');

      console.log(`✅ Order placed successfully: ${orderNumber}`);

      sendResponse(res, 201, true, "Order placed successfully", {
        orderId,
        orderNumber,
        totalAmount,
        itemCount: orderItems.length
      });

    } catch (error) {
      console.error("❌ Place order error:", error);
      sendResponse(res, 500, false, "Failed to place order");
    }
  },

  // Get customer orders
  getOrders: async (req, res) => {
    try {
      const customerId = req.customer.id;
      const orders = await OrderModel.getOrdersByCustomer(customerId);
      sendResponse(res, 200, true, "Orders retrieved successfully", orders);
    } catch (error) {
      console.error("Get orders error:", error);
      sendResponse(res, 500, false, "Failed to get orders");
    }
  },

  // Get order details
  getOrderById: async (req, res) => {
    try {
      const { orderId } = req.params;
      const customerId = req.customer.id;
      const order = await OrderModel.getOrderDetails(orderId, customerId);
      if (!order) {
        return sendResponse(res, 404, false, "Order not found");
      }
      sendResponse(res, 200, true, "Order details retrieved successfully", order);
    } catch (error) {
      console.error("Get order details error:", error);
      sendResponse(res, 500, false, "Failed to get order details");
    }
  },
  cancelOrder: async (req, res) => {
    // TODO: Implement cancel order logic
    return sendResponse(res, 501, false, "Cancel order not implemented yet");
  },
  getOrderHistory: async (req, res) => {
    // TODO: Implement order history logic
    return sendResponse(res, 501, false, "Order history not implemented yet");
  },
  placeOrderFromCart: async (req, res) => {
    // TODO: Implement place order from cart logic
    return sendResponse(res, 501, false, "Place order from cart not implemented yet");
  }
};

module.exports = orderController; 
