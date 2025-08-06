import axios from "axios";
import Swal from 'sweetalert2';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL+"/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // Changed to false for now
});

// Always send token if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      Swal.fire({
        title: 'Network Error',
        text: 'Unable to connect to the server. Please check your internet connection or try again later.',
        icon: 'error',
        confirmButtonColor: '#ec4899'
      });
    } else if (error.response.status >= 500) {
      Swal.fire({
        title: 'Server Error',
        text: error.response.data?.message || 'An unexpected server error occurred.',
        icon: 'error',
        confirmButtonColor: '#ec4899'
      });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
