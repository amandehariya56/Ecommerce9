import { createContext, useEffect, useState, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { setAuthToken } from "../utils/axiosInstance";
import authService from "../services/authService";
import { toast } from "react-toastify";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check token validity locally
  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (err) {
      console.error("Token validation error:", err);
      return false;
    }
  };
  
  // Login function
  const login = (token) => {
    try {
      const decodedUser = jwtDecode(token);
      localStorage.setItem("token", token);
      setAuthToken(token);
      setUser(decodedUser);
      
      // Debug: Log complete token
      console.log("Complete JWT Token:", token);
      console.log("Token length:", token.length);
      console.log("Decoded user:", decodedUser);
    } catch (error) {
      console.error("Failed to decode token on login:", error);
      logout();
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    setAuthToken(null);
    setUser(null);
    // Clear any cookies if they exist
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
  };

  // Force logout - clears everything
  const forceLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setAuthToken(null);
    setUser(null);
    // Clear all cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    // Force page reload to clear any cached state
    window.location.href = "/login";
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      console.log("Initializing auth with token:", token ? "exists" : "not found");
      
      if (token && isTokenValid(token)) {
        // Token exists and is valid locally, set user
        try {
          const decodedUser = jwtDecode(token);
          setAuthToken(token);
          setUser(decodedUser);
          console.log("User authenticated successfully from local token");
        } catch (error) {
          console.error("Failed to decode token:", error);
          logout();
        }
      } else {
        console.log("No valid token found, user not authenticated");
        logout();
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, forceLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
