import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaShoppingCart,
  FaTrash,
  FaPlus,
  FaMinus,
  FaArrowLeft,
  FaTruck,
  FaShieldAlt,
  FaTag,
  FaHeart
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import cartService from '../services/cartService';
import Swal from 'sweetalert2';

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login to view your cart',
        showCancelButton: true,
        confirmButtonText: 'Login',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        } else {
          navigate('/');
        }
      });
      return;
    }
    fetchCart();
  }, [user, navigate]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      // Check if user has access token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const res = await cartService.getCart();
      console.log('Cart response:', res);
      setCart(res.data?.items || res.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart([]);

      if (error.response?.status === 401 || error.message === 'No access token found') {
        Swal.fire({
          icon: 'error',
          title: 'Session Expired',
          text: 'Please login again to view your cart',
          confirmButtonText: 'Login'
        }).then(() => {
          // Clear any invalid tokens
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          navigate('/login');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load cart items'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (cartItemId, productName) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Remove Item',
      text: `Are you sure you want to remove "${productName}" from your cart?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    });

    if (result.isConfirmed) {
      try {
        setUpdating(prev => ({ ...prev, [cartItemId]: true }));
        await cartService.removeFromCart(cartItemId);
        setCart(cart.filter(item => item.id !== cartItemId));
        Swal.fire({
          icon: 'success',
          title: 'Removed!',
          text: 'Item has been removed from your cart',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error removing item:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to remove item from cart'
        });
      } finally {
        setUpdating(prev => ({ ...prev, [cartItemId]: false }));
      }
    }
  };

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    const quantity = Math.max(1, Number(newQuantity));
    try {
      setUpdating(prev => ({ ...prev, [cartItemId]: true }));
      await cartService.updateQuantity(cartItemId, quantity);
      setCart(cart.map(item =>
        item.id === cartItemId ? { ...item, quantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update quantity'
      });
    } finally {
      setUpdating(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  const handleClearCart = async () => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Clear Cart',
      text: 'Are you sure you want to remove all items from your cart?',
      showCancelButton: true,
      confirmButtonText: 'Yes, Clear All',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    });

    if (result.isConfirmed) {
      try {
        await cartService.clearCart();
        setCart([]);
        Swal.fire({
          icon: 'success',
          title: 'Cart Cleared!',
          text: 'All items have been removed from your cart',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error clearing cart:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to clear cart'
        });
      }
    }
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 499 ? 0 : 49;
  const discount = subtotal > 1000 ? subtotal * 0.1 : 0;
  const total = subtotal + shipping - discount;

  // Handle checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Empty Cart',
        text: 'Please add items to cart before checkout'
      });
      return;
    }
    navigate('/checkout');
  };

  // Loading state
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center text-gray-600 hover:text-pink-600 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Continue Shopping
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaShoppingCart className="mr-3 text-pink-500" />
              Shopping Cart ({cart.length} items)
            </h1>
          </div>
          {cart.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 font-medium flex items-center space-x-1"
            >
              <FaTrash className="text-sm" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          /* Empty Cart */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-12 text-center"
          >
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet</p>
            <Link
              to="/"
              className="inline-flex items-center bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
            >
              <FaShoppingCart className="mr-2" />
              Start Shopping
            </Link>
          </motion.div>
        ) : (
          /* Cart with Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={
                          item.images && Array.isArray(item.images) 
                            ? item.images[0] 
                            : item.images && typeof item.images === 'string'
                            ? JSON.parse(item.images)[0] || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA0NUw3NSA2MEg0NUw2MCA0NVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K"
                            : item.image || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA0NUw3NSA2MEg0NUw2MCA0NVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K"
                        }
                        alt={item.name || item.product_name}
                        className="w-24 h-24 object-cover rounded-lg border"
                        onError={(e) => {
                          e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA0NUw3NSA2MEg0NUw2MCA0NVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K";
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {item.name || item.product_name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {item.category_name && `Category: ${item.category_name}`}
                          </p>
                          <div className="flex items-center space-x-4">
                            <span className="text-2xl font-bold text-pink-600">
                              ₹{item.price}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ₹{(item.price * 1.3).toFixed(0)}
                            </span>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                              23% OFF
                            </span>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemove(item.id, item.name || item.product_name)}
                          disabled={updating[item.id]}
                          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <FaTrash />
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-700">Quantity:</span>
                          <div className="flex items-center border rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updating[item.id]}
                              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FaMinus className="text-sm" />
                            </button>
                            <span className="px-4 py-2 border-x min-w-[60px] text-center">
                              {updating[item.id] ? '...' : item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={updating[item.id]}
                              className="p-2 hover:bg-gray-100 disabled:opacity-50"
                            >
                              <FaPlus className="text-sm" />
                            </button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            ₹{item.price} × {item.quantity}
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center space-x-4 mt-4 pt-4 border-t">
                        <button className="text-pink-600 hover:text-pink-700 text-sm font-medium flex items-center space-x-1">
                          <FaHeart className="text-xs" />
                          <span>Save for Later</span>
                        </button>
                        <Link
                          to={`/product/${item.product_id || item.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View Product
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm p-6 sticky top-8"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                {/* Price Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.length} items)</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount (10%)</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Savings Info */}
                {shipping === 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center text-green-800 text-sm">
                      <FaTruck className="mr-2" />
                      <span>You saved ₹49 on shipping!</span>
                    </div>
                  </div>
                )}

                {subtotal < 499 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="text-blue-800 text-sm">
                      <FaTruck className="inline mr-2" />
                      Add ₹{(499 - subtotal).toFixed(2)} more for FREE shipping
                    </div>
                  </div>
                )}

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-pink-500 text-white py-4 rounded-lg font-semibold hover:bg-pink-600 transition-colors mb-4 flex items-center justify-center space-x-2"
                >
                  <FaShoppingCart />
                  <span>Proceed to Checkout</span>
                </button>

                {/* Continue Shopping */}
                <Link
                  to="/"
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <FaArrowLeft />
                  <span>Continue Shopping</span>
                </Link>

                {/* Trust Indicators */}
                <div className="mt-6 pt-6 border-t">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaShieldAlt className="text-green-600 mr-3" />
                      <span>100% Secure Payments</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaTruck className="text-blue-600 mr-3" />
                      <span>Free delivery on orders above ₹499</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaTag className="text-purple-600 mr-3" />
                      <span>Best prices guaranteed</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;