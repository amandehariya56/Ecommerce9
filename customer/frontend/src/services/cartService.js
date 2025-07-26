import axiosInstance from '../utils/axiosInstance';

const cartService = {
  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await axiosInstance.post('/cart/add', {
        productId,
        quantity
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get cart items
  getCart: async () => {
    try {
      const response = await axiosInstance.get('/cart');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Remove item from cart
  removeFromCart: async (cartItemId) => {
    try {
      const response = await axiosInstance.delete(`/cart/remove/${cartItemId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update cart item quantity
  updateQuantity: async (cartItemId, quantity) => {
    try {
      const response = await axiosInstance.put(`/cart/update/${cartItemId}`, {
        quantity
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      const response = await axiosInstance.delete('/cart/clear');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default cartService; 