import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaShoppingBag, 
  FaEye, 
  FaTimes, 
  FaArrowLeft,
  FaCalendarAlt,
  FaRupeeSign,
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import Swal from 'sweetalert2';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate, currentPage, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching orders...');
      console.log('Token:', localStorage.getItem('accessToken'));

      const response = await orderService.getOrders(currentPage, 10);
      console.log('📦 Orders response:', response);

      if (response.success) {
        console.log('📦 Response data:', response.data);

        // Handle different response structures
        let ordersArray = [];
        if (Array.isArray(response.data?.orders)) {
          ordersArray = response.data.orders;
        } else if (Array.isArray(response.data)) {
          ordersArray = response.data;
        } else if (response.data?.orders && Array.isArray(response.data.orders.orders)) {
          ordersArray = response.data.orders.orders;
        }

        console.log('📦 Orders array:', ordersArray);
        setOrders(ordersArray);
        setTotalPages(response.data?.pagination?.totalPages || 1);
      } else {
        console.log('❌ Orders response not successful:', response);
        setOrders([]);
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);

      // Check if it's an authentication error
      if (error.status === 401 || error.message?.includes('token') || error.message?.includes('auth')) {
        Swal.fire({
          icon: 'warning',
          title: 'Session Expired',
          text: 'Please login again to view your orders',
          confirmButtonText: 'Login'
        }).then(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          navigate('/login');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load orders. Please try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId, orderNumber) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Cancel Order',
      text: `Are you sure you want to cancel order #${orderNumber}?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Keep',
      confirmButtonColor: '#ef4444'
    });

    if (result.isConfirmed) {
      try {
        const response = await orderService.cancelOrder(orderId);
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Order Cancelled',
            text: 'Your order has been cancelled successfully',
            timer: 2000,
            showConfirmButton: false
          });
          fetchOrders();
        }
      } catch (error) {
        console.error('Error cancelling order:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to cancel order'
        });
      }
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: FaBox, text: 'Pending' };
      case 'confirmed':
        return { color: 'bg-blue-100 text-blue-800', icon: FaCheckCircle, text: 'Confirmed' };
      case 'processing':
        return { color: 'bg-purple-100 text-purple-800', icon: FaBox, text: 'Processing' };
      case 'shipped':
        return { color: 'bg-indigo-100 text-indigo-800', icon: FaTruck, text: 'Shipped' };
      case 'delivered':
        return { color: 'bg-green-100 text-green-800', icon: FaCheckCircle, text: 'Delivered' };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800', icon: FaTimesCircle, text: 'Cancelled' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: FaBox, text: status };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center text-gray-600 hover:text-pink-600 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to Home
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaShoppingBag className="mr-3 text-pink-500" />
              My Orders ({orders.length})
            </h1>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-12 text-center"
          >
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders found</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
            <Link
              to="/"
              className="inline-flex items-center bg-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
            >
              <FaShoppingBag className="mr-2" />
              Start Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.order_number}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <FaCalendarAlt className="mr-2" />
                            <span>Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center text-lg font-bold text-gray-900">
                            <FaRupeeSign className="text-sm" />
                            <span>{order.total_amount}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {order.item_count} item{order.item_count > 1 ? 's' : ''}
                          </div>
                        </div>
                        
                        <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                          <StatusIcon className="mr-2 text-xs" />
                          <span>{statusInfo.text}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                      <div className="flex items-center space-x-4">
                        <Link
                          to={`/orders/${order.id}`}
                          className="flex items-center text-pink-600 hover:text-pink-700 font-medium"
                        >
                          <FaEye className="mr-2" />
                          View Details
                        </Link>
                        {order.status === 'delivered' && (
                          <button className="text-blue-600 hover:text-blue-700 font-medium">
                            Rate & Review
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                          <button
                            onClick={() => handleCancelOrder(order.id, order.order_number)}
                            className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <FaTimes className="mr-2" />
                            Cancel Order
                          </button>
                        )}
                        {order.status === 'delivered' && (
                          <button className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors">
                            Reorder
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-pink-500 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
