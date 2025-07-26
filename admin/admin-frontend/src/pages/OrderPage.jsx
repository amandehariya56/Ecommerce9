import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaEdit,
  FaCalendarAlt,
  FaShoppingBag,
  FaUser,
  FaRupeeSign,
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import orderService from '../services/orderService';

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getAllOrders(currentPage, 20, statusFilter);
      if (response.success) {
        setOrders(response.data.orders);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchOrders();
      return;
    }

    setLoading(true);
    try {
      const response = await orderService.searchOrders(searchTerm, 1, 20);
      if (response.success) {
        setOrders(response.data.orders);
        setPagination(response.data.pagination);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error searching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await orderService.getOrderById(orderId);
      if (response.success) {
        setSelectedOrder(response.data);
        setShowOrderModal(true);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const response = await orderService.updateOrderStatus(
        selectedOrder.id, 
        newStatus, 
        statusMessage
      );
      
      if (response.success) {
        alert('Order status updated successfully!');
        setShowStatusModal(false);
        setShowOrderModal(false);
        fetchOrders();
        setNewStatus('');
        setStatusMessage('');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaShoppingBag className="mr-3 text-blue-600" />
            Order Management
          </h1>
          <p className="text-gray-600 mt-1">Manage customer orders and track status</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="flex items-center space-x-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number, customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{order.order_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.item_count} item{order.item_count > 1 ? 's' : ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.customer_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customer_email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <FaRupeeSign className="mr-1 text-xs" />
                          {order.total_amount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon className="mr-1" />
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-2" />
                          {formatDate(order.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewOrder(order.id)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <FaEye className="mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setNewStatus(order.status);
                              setShowStatusModal(true);
                            }}
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <FaEdit className="mr-1" />
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Order #{selectedOrder.order_number}</h2>
                    <p className="text-blue-100">Complete Order Details & Management</p>
                  </div>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="text-white hover:text-gray-200 text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Customer Info */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                      <FaUser className="mr-2" />
                      Customer Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                      <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                      <p><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-bold text-green-800 mb-3 flex items-center">
                      <FaShoppingBag className="mr-2" />
                      Order Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Order Date:</strong> {formatDate(selectedOrder.created_at)}</p>
                      <p><strong>Status:</strong>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusInfo(selectedOrder.status).color}`}>
                          {selectedOrder.status.toUpperCase()}
                        </span>
                      </p>
                      <p><strong>Total:</strong>
                        <span className="text-green-600 font-bold flex items-center">
                          <FaRupeeSign className="mr-1" />
                          {selectedOrder.total_amount}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-bold text-purple-800 mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setShowStatusModal(true);
                          setNewStatus(selectedOrder.status);
                        }}
                        className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 flex items-center justify-center"
                      >
                        <FaEdit className="mr-2" />
                        Update Status
                      </button>
                      <button className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600">
                        Print Invoice
                      </button>
                      <button className="w-full bg-orange-500 text-white px-3 py-2 rounded text-sm hover:bg-orange-600">
                        Send Email
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                      <FaBox className="mr-2 text-blue-500" />
                      Order Items ({selectedOrder.items.length})
                    </h3>
                    <div className="bg-white border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedOrder.items.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  {item.product_images && item.product_images[0] && (
                                    <img
                                      src={item.product_images[0]}
                                      alt={item.product_name}
                                      className="w-10 h-10 rounded object-cover mr-3"
                                    />
                                  )}
                                  <div>
                                    <p className="font-medium text-gray-900">{item.product_name}</p>
                                    <p className="text-sm text-gray-500">SKU: {item.product_id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">₹{item.price}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Delivery Address */}
                {selectedOrder.shipping_address && (
                  <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-bold text-yellow-800 mb-3 flex items-center">
                      <FaMapMarkerAlt className="mr-2" />
                      Delivery Address
                    </h3>
                    <div className="text-sm text-gray-700">
                      <p className="font-medium">{selectedOrder.shipping_address}</p>
                    </div>
                  </div>
                )}

                {/* Order Status History */}
                {selectedOrder.status_history && selectedOrder.status_history.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-bold text-gray-800 mb-4">Order Status History</h3>
                    <div className="space-y-3">
                      {selectedOrder.status_history.map((history, index) => (
                        <div key={index} className="flex items-center p-3 bg-gray-50 rounded">
                          <div className="flex-1">
                            <p className="font-medium">{history.status.toUpperCase()}</p>
                            {history.message && <p className="text-sm text-gray-600">{history.message}</p>}
                            <p className="text-xs text-gray-500">{formatDate(history.created_at)}</p>
                          </div>
                          {history.admin_name && (
                            <p className="text-sm text-blue-600">by {history.admin_name}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-bold mb-4">Update Order Status</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Message (Optional)</label>
                  <textarea
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    rows="3"
                    placeholder="Add a note about this status update..."
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleUpdateStatus}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Update Status
                  </button>
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={!pagination.hasPrevPage}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                disabled={!pagination.hasNextPage}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                  <span className="font-medium">{pagination.totalPages}</span> ({pagination.totalOrders} total orders)
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={!pagination.hasPrevPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                    disabled={!pagination.hasNextPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;
