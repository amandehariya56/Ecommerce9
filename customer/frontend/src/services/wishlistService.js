import axiosInstance from '../utils/axiosInstance';

const wishlistService = {
  // Add item to wishlist
  addToWishlist: async (productId) => {
    try {
      const response = await axiosInstance.post('/wishlist/add', {
        productId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get wishlist items
  getWishlist: async () => {
    try {
      const response = await axiosInstance.get('/wishlist');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Remove item from wishlist
  removeFromWishlist: async (wishlistItemId) => {
    try {
      const response = await axiosInstance.delete(`/wishlist/remove/${wishlistItemId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Check if item is in wishlist
  checkWishlist: async (productId) => {
    try {
      const response = await axiosInstance.get(`/wishlist/check/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Move item from wishlist to cart
  moveToCart: async (wishlistItemId) => {
    try {
      const response = await axiosInstance.post(`/wishlist/move-to-cart/${wishlistItemId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Clear wishlist
  clearWishlist: async () => {
    try {
      const response = await axiosInstance.delete('/wishlist/clear');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default wishlistService; 