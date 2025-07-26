import axiosInstance from '../utils/axiosInstance';

const PRODUCT_DETAILS_API_BASE_URL = '/product-details';

export const productDetailsService = {
  // Create product details
  createProductDetails: async (productDetails) => {
    try {
      const response = await axiosInstance.post(PRODUCT_DETAILS_API_BASE_URL, productDetails);
      return response.data;
    } catch (error) {
      console.error('Error creating product details:', error);
      throw error;
    }
  },

  // Get product details by product ID
  getProductDetails: async (productId) => {
    try {
      const response = await axiosInstance.get(`${PRODUCT_DETAILS_API_BASE_URL}/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product details:', error);
      throw error;
    }
  },

  // Update product details
  updateProductDetails: async (productId, productDetails) => {
    try {
      const response = await axiosInstance.put(`${PRODUCT_DETAILS_API_BASE_URL}/${productId}`, productDetails);
      return response.data;
    } catch (error) {
      console.error('Error updating product details:', error);
      throw error;
    }
  },

  // Delete product details
  deleteProductDetails: async (productId) => {
    try {
      const response = await axiosInstance.delete(`${PRODUCT_DETAILS_API_BASE_URL}/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product details:', error);
      throw error;
    }
  },

  // Get all product details
  getAllProductDetails: async () => {
    try {
      const response = await axiosInstance.get(PRODUCT_DETAILS_API_BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching all product details:', error);
      throw error;
    }
  },

  // Upsert product details (create or update)
  upsertProductDetails: async (productDetails) => {
    try {
      const response = await axiosInstance.post(`${PRODUCT_DETAILS_API_BASE_URL}/upsert`, productDetails);
      return response.data;
    } catch (error) {
      console.error('Error upserting product details:', error);
      throw error;
    }
  }
};

export default productDetailsService; 