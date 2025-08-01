import axios from '../utils/axiosInstance';

const CATEGORY_API_BASE_URL = 'http://localhost:5001/api/products';

export const categoryService = {
  // Get all categories
  getAllCategories: async () => {
    try {
      const response = await axios.get(`${CATEGORY_API_BASE_URL}/categories/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get category by ID
  getCategoryById: async (id) => {
    try {
      const response = await axios.get(`${CATEGORY_API_BASE_URL}/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }
};