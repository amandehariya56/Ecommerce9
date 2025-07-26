import api from './api';

const addressService = {
  // Get all customer addresses
  getAddresses: async () => {
    try {
      const response = await api.get('/addresses');
      return response.data;
    } catch (error) {
      console.error('Error getting addresses:', error);
      throw error;
    }
  },

  // Get address by ID
  getAddressById: async (addressId) => {
    try {
      const response = await api.get(`/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting address by ID:', error);
      throw error;
    }
  },

  // Add new address
  addAddress: async (addressData) => {
    try {
      const response = await api.post('/addresses', addressData);
      return response.data;
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    try {
      const response = await api.put(`/addresses/${addressId}`, addressData);
      return response.data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  },

  // Delete address
  deleteAddress: async (addressId) => {
    try {
      const response = await api.delete(`/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  },

  // Set default address
  setDefaultAddress: async (addressId) => {
    try {
      const response = await api.put(`/addresses/${addressId}/set-default`);
      return response.data;
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  },

  // Get default address
  getDefaultAddress: async () => {
    try {
      const response = await api.get('/addresses/default');
      return response.data;
    } catch (error) {
      console.error('Error getting default address:', error);
      throw error;
    }
  }
};

export default addressService;
