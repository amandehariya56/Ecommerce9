import axios from '../utils/axiosInstance';

const SUBCATEGORY_API_BASE_URL = 'http://localhost:5001/api/products/subcategories';

export const subcategoryService = {
  // Get all subcategories
  getAllSubcategories: async () => {
    try {
      const response = await axios.get(`${SUBCATEGORY_API_BASE_URL}/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw error;
    }
  },

  // Get subcategories by category ID
  getSubcategoriesByCategory: async (categoryId) => {
    try {
      const response = await axios.get(`${SUBCATEGORY_API_BASE_URL}/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subcategories by category:', error);
      throw error;
    }
  },

  // Get subcategory by ID
  getSubcategoryById: async (id) => {
    try {
      const response = await axios.get(`${SUBCATEGORY_API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subcategory:', error);
      throw error;
    }
  }
}; 