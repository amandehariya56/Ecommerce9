import axios from '../utils/axiosInstance';

const SUBCATEGORY_API_BASE_URL = import.meta.env.VITE_API_BASE_URL+'/api/products';

export const subcategoryService = {
  // Get all subcategories
  getAllSubcategories: async () => {
    try {
      const response = await axios.get(`${SUBCATEGORY_API_BASE_URL}/subcategories/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw error;
    }
  },

  // Get subcategories by category ID
  getSubcategoriesByCategory: async (categoryId) => {
    try {
      const response = await axios.get(`${SUBCATEGORY_API_BASE_URL}/categories/${categoryId}/subcategories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subcategories by category:', error);
      throw error;
    }
  },

  // Get subcategory by ID
  getSubcategoryById: async (id) => {
    try {
      const response = await axios.get(`${SUBCATEGORY_API_BASE_URL}/subcategories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subcategory:', error);
      throw error;
    }
  }
}; 