import axiosInstance from '../utils/axiosInstance';

const orderService = {
  // Get all orders
  getAllOrders: async (page = 1, limit = 20, status = null) => {
    try {
      let url = `/orders?page=${page}&limit=${limit}`;
      if (status && status !== 'all') {
        url += `&status=${status}`;
      }
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error getting all orders:', error);
      throw error;
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting order by ID:', error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status, message = null) => {
    try {
      const response = await axiosInstance.put(`/orders/${orderId}/status`, {
        status,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Get order statistics
  getOrderStats: async () => {
    try {
      const response = await axiosInstance.get('/orders/stats');
      return response.data;
    } catch (error) {
      console.error('Error getting order stats:', error);
      throw error;
    }
  },

  // Get dashboard data
  getDashboardData: async () => {
    try {
      const response = await axiosInstance.get('/orders/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  },

  // Search orders
  searchOrders: async (searchTerm, page = 1, limit = 20) => {
    try {
      const response = await axiosInstance.get(`/orders/search?search=${encodeURIComponent(searchTerm)}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error searching orders:', error);
      throw error;
    }
  },

  // Get orders by date range
  getOrdersByDateRange: async (startDate, endDate, page = 1, limit = 20) => {
    try {
      const response = await axiosInstance.get(`/orders/date-range?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error getting orders by date range:', error);
      throw error;
    }
  }
};

export default orderService;
