import api from './api';

export const productService = {
  // Get all products with pagination and filters
  getAllProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Search products
  searchProducts: async (query, params = {}) => {
    try {
      const response = await api.get(`/products/search/${encodeURIComponent(query)}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (categoryId, params = {}) => {
    try {
      const response = await api.get(`/products/category/${categoryId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  },

  // Get products by subcategory
  getProductsBySubcategory: async (subcategoryId, params = {}) => {
    try {
      const response = await api.get(`/products/subcategory/${subcategoryId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products by subcategory:', error);
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8) => {
    try {
      const response = await api.get('/products/featured/list', { 
        params: { limit } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  // Get categories
  getCategories: async () => {
    try {
      const response = await api.get('/products/categories/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get subcategories by category
  getSubcategories: async (categoryId) => {
    try {
      const response = await api.get(`/products/categories/${categoryId}/subcategories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw error;
    }
  },

  // Get product reviews
  getProductReviews: async (productId) => {
    try {
      const response = await api.get(`/products/${productId}/reviews`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }
  },

  // Get related products
  getRelatedProducts: async (productId, limit = 4) => {
    try {
      const response = await api.get(`/products/${productId}/related`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching related products:', error);
      throw error;
    }
  }
};
