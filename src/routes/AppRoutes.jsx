import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

import Layout from "../components/layout/layout";
import Protected from "../utils/protected";

import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/Dashboard";
import CategoryPage from "../pages/CategoryPage";
import SubcategoryPage from "../pages/SubcategoryPage";
import ProductPage from "../pages/ProductPage";
import UserPage from "../pages/UserPage";
import CustomerManagementPage from "../pages/CustomerManagementPage";
import RolePage from "../pages/RolePage";
import OrderPage from "../pages/OrderPage";
import Logout from "../pages/logout";

const AppRoutes = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Default route - redirect to login if not authenticated */}
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />

      {/* Login route */}
      <Route
        path="/login"
        element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />}
      />

      {/* Logout route - outside nested structure */}
      <Route
        path="/logout"
        element={
          <Protected>
            <Logout />
          </Protected>
        }
      />

      {/* Protected routes - only accessible when logged in */}
      <Route
        path="/"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="categories" element={<CategoryPage />} />
        <Route path="subcategories" element={<SubcategoryPage />} />
        <Route path="products" element={<ProductPage />} />
        <Route path="users" element={<UserPage />} />
        <Route path="customers" element={<CustomerManagementPage />} />
        <Route path="roles" element={<RolePage />} />
        <Route path="orders" element={<OrderPage />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
};

export default AppRoutes;
