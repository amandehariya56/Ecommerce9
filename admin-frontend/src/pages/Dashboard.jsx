import React, { useEffect, useState } from "react";
import {
  LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getAllCategories } from "../services/categoryService";
import { getAllSubcategories } from "../services/subcategoryService";
import { getAllProducts } from "../services/productService";
import { getAllUsers } from "../services/userService";
import { getAllRoles } from "../services/roleService";
import { getAllAssignedRoles } from "../services/roleAssignService";

const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#FF6666", "#33CCFF"];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({ 
    users: 0, 
    categories: 0, 
    subcategories: 0, 
    products: 0,
    roles: 0,
    assignedRoles: 0
  });
  const [roleBreakdown, setRoleBreakdown] = useState([]);
  const [productTrend, setProductTrend] = useState([]);
  const [recentData, setRecentData] = useState({
    recentUsers: [],
    recentProducts: [],
    recentCategories: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔄 Fetching dashboard data...");
      
      const [
        catRes, subcatRes, prodRes, userRes, roleRes, assignRes
      ] = await Promise.all([
        getAllCategories(),
        getAllSubcategories(),
        getAllProducts(),
        getAllUsers(),
        getAllRoles(),
        getAllAssignedRoles(),
      ]);

      console.log("✅ Data fetched successfully:", {
        categories: catRes.data?.data || catRes.data,
        subcategories: subcatRes.data?.data || subcatRes.data,
        products: prodRes.data?.data || prodRes.data,
        users: userRes.data?.data || userRes.data,
        roles: roleRes.data?.data || roleRes.data,
        assignments: assignRes.data?.data || assignRes.data
      });

      // Extract data properly
      const categories = catRes.data?.data || catRes.data || [];
      const subcategories = subcatRes.data?.data || subcatRes.data || [];
      const products = prodRes.data?.data || prodRes.data || [];
      const users = userRes.data?.data || userRes.data || [];
      const roles = roleRes.data?.data || roleRes.data || [];
      const assignments = assignRes.data?.data || assignRes.data || [];

      setCounts({
        categories: categories.length,
        subcategories: subcategories.length,
        products: products.length,
        users: users.length,
        roles: roles.length,
        assignedRoles: assignments.length
      });

      // Generate product trend data (last 7 days)
      const trend = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          name: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          Products: Math.floor(Math.random() * 20) + 10,
        };
      });
      setProductTrend(trend);

      // Process role breakdown
      const roleMap = {};
      assignments.forEach((assign) => {
        const role = roles.find((r) => r.role_id === assign.role_id);
        if (role) {
          const roleName = role.role_name;
          roleMap[roleName] = (roleMap[roleName] || 0) + 1;
        }
      });

      const pieData = Object.entries(roleMap).map(([name, value]) => ({ name, value }));
      setRoleBreakdown(pieData.length ? pieData : [{ name: "No Active Role Assigned", value: 1 }]);

      // Set recent data
      setRecentData({
        recentUsers: users.slice(0, 5),
        recentProducts: products.slice(0, 5),
        recentCategories: categories.slice(0, 5)
      });

      setLoading(false);
    } catch (error) {
      console.error("❌ Dashboard error:", error);
      setError("Failed to load dashboard data. Please try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-100 to-purple-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-red-100 to-pink-100">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Ecommerce Admin Dashboard</h1>
        <button 
          onClick={fetchDashboardData}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
        <Card title="Users" value={counts.users} icon="👥" color="blue" />
        <Card title="Categories" value={counts.categories} icon="📂" color="green" />
        <Card title="Subcategories" value={counts.subcategories} icon="📁" color="purple" />
        <Card title="Products" value={counts.products} icon="📦" color="orange" />
        <Card title="Roles" value={counts.roles} icon="🔐" color="red" />
        <Card title="Assigned Roles" value={counts.assignedRoles} icon="✅" color="teal" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Product Trend (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={productTrend}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Products" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">User Role Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={roleBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {roleBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
          <div className="space-y-3">
            {recentData.recentUsers.length > 0 ? (
              recentData.recentUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">
                      {user?.name || user?.username || `User ${user?.user_id || index + 1}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user?.email || 'No email available'}
                    </p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    ID: {user?.user_id || 'N/A'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No users found</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Products</h2>
          <div className="space-y-3">
            {recentData.recentProducts.length > 0 ? (
              recentData.recentProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">
                      {product?.name || product?.product_name || `Product ${product?.id || product?.product_id || index + 1}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      ₹{product?.price || 'N/A'}
                    </p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    ID: {product?.id || product?.product_id || 'N/A'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No products found</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Categories</h2>
          <div className="space-y-3">
            {recentData.recentCategories.length > 0 ? (
              recentData.recentCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">
                      {category?.name || category?.category_name || `Category ${category?.id || category?.category_id || index + 1}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {category?.description || 'No description'}
                    </p>
                  </div>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    ID: {category?.id || category?.category_id || 'N/A'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No categories found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value, icon, color }) => (
  <div className={`bg-white rounded-xl shadow-md p-6 text-center border-t-4 border-${color}-400 hover:shadow-lg transition-shadow`}>
    <div className="text-4xl mb-2">{icon}</div>
    <h2 className="text-lg text-gray-600">{title}</h2>
    <p className={`text-3xl font-bold text-${color}-600 mt-2`}>{value}</p>
  </div>
);

export default Dashboard;
