import api from './api';

export const authService = {
  // Send OTP for registration
  sendRegistrationOTP: async (userData) => {
    try {
      const response = await api.post('/customers/send-otp', userData);
      return response.data;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  },

  // Verify OTP and register
  verifyOTPAndRegister: async (otpData) => {
    try {
      const response = await api.post('/customers/verify-otp', otpData);
      return response.data;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },

  // Resend OTP
  resendOTP: async (phone) => {
    try {
      const response = await api.post('/customers/resend-otp', { phone });
      return response.data;
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw error;
    }
  },

  // Login customer
  login: async (credentials) => {
    try {
      const response = await api.post('/customers/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Register customer (direct registration without OTP)
  register: async (userData) => {
    try {
      const response = await api.post('/customers/register', userData);
      return response.data;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  },

  // Logout customer
  logout: async () => {
    try {
      const response = await api.post('/customers/logout');
      return response.data;
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  // Request reset password OTP
  requestResetOTP: async (phone) => {
    try {
      const response = await api.post('/customers/request-reset-otp', { phone });
      return response.data;
    } catch (error) {
      console.error('Error requesting reset OTP:', error);
      throw error;
    }
  },

  // Verify reset OTP
  verifyResetOTP: async (otpData) => {
    try {
      const response = await api.post('/customers/verify-reset-otp', otpData);
      return response.data;
    } catch (error) {
      console.error('Error verifying reset OTP:', error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (resetData) => {
    try {
      const response = await api.post('/customers/reset-password', resetData);
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  // Get customer profile
  getProfile: async () => {
    try {
      const response = await api.get('/customers/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Update customer profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/customers/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Refresh access token
  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/customers/refresh', { refreshToken });
      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }
};

// Legacy exports for backward compatibility
export const requestResetOTP = authService.requestResetOTP;
export const verifyResetOTP = authService.verifyResetOTP;
export const resetPassword = authService.resetPassword;

