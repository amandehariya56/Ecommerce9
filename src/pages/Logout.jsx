// src/pages/Logout.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        // ✅ Clear all local storage
        localStorage.clear();
        
        // ✅ Clear session storage
        sessionStorage.clear();
        
        // ✅ Clear cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        // ✅ Call logout from context
        logout();
        
        // ✅ Navigate to login
        navigate("/login", { replace: true });
      } catch (error) {
        console.error("Logout failed", error);
        // Even if there's an error, still logout locally
        logout();
        navigate("/login", { replace: true });
      }
    };

    logoutUser();
  }, [navigate, logout]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Logging out...</p>
      </div>
    </div>
  );
};

export default Logout;
