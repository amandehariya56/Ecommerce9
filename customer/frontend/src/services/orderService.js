import axiosInstance from '../utils/axiosInstance';
import api from './api';

const orderService = {
  // Place order (new method)
  placeOrder: async (orderData) => {
    try {
      const response = await api.post('/orders/place', orderData);
      return response.data;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  },

  // Place order from cart
  placeOrderFromCart: async (cartItemIds) => {
    try {
      const response = await axiosInstance.post('/orders/place-from-cart', {
        cartItemIds
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Place direct order
  placeDirectOrder: async (productId, quantity = 1) => {
    try {
      const response = await axiosInstance.post('/orders/place-direct', {
        productId,
        quantity
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get customer orders
  getOrders: async () => {
    try {
      const response = await axiosInstance.get('/orders');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    try {
      const response = await axiosInstance.put(`/orders/cancel/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get order status history
  getOrderHistory: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error getting order history:', error);
      throw error;
    }
  },

  // Get order statistics
  getOrderStats: async () => {
    try {
      const response = await axiosInstance.get('/orders/stats/summary');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default orderService; 