import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaMapMarkerAlt, 
  FaPlus, 
  FaEdit, 
  FaTrash,
  FaCreditCard,
  FaMoneyBillWave,
  FaShoppingCart,
  FaArrowLeft,
  FaCheck
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import cartService from '../services/cartService';
import addressService from '../services/addressService';
import orderService from '../services/orderService';
import Swal from 'sweetalert2';
import PaymentButton from '../components/ui/PaymentButton';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Address form state
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    address_type: 'home',
    is_default: false
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch cart and addresses in parallel
      const [cartResponse, addressResponse] = await Promise.all([
        cartService.getCart(),
        addressService.getAddresses()
      ]);

      const cartItems = cartResponse.data?.items || cartResponse.items || [];
      setCart(cartItems);

      const addressList = addressResponse.data || [];
      setAddresses(addressList);

      // Set default address if available
      const defaultAddress = addressList.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }

      // If cart is empty, redirect to cart page
      if (cartItems.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Empty Cart',
          text: 'Your cart is empty. Please add items before checkout.',
          confirmButtonText: 'Go to Cart'
        }).then(() => {
          navigate('/cart');
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load checkout data'
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 499 ? 0 : 49;
  const discount = subtotal > 1000 ? subtotal * 0.1 : 0;
  const total = subtotal + shipping - discount;

  // Handle address form submission
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await addressService.addAddress(addressForm);
      if (response.success) {
        await fetchData(); // Refresh addresses
        setShowAddressForm(false);
        setAddressForm({
          name: '',
          phone: '',
          address_line_1: '',
          address_line_2: '',
          city: '',
          state: '',
          pincode: '',
          landmark: '',
          address_type: 'home',
          is_default: false
        });
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Address added successfully',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error adding address:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to add address'
      });
    }
  };



  // Handle order placement - redirect to payment page
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Swal.fire({
        icon: 'warning',
        title: 'Address Required',
        text: 'Please select a delivery address'
      });
      return;
    }

    // Store order data in localStorage for payment page
    const orderData = {
      shipping_address: formatAddressForOrder(selectedAddress),
      billing_address: formatAddressForOrder(selectedAddress),
      notes: notes.trim() || null,
      cart: cart,
      total: total
    };

    localStorage.setItem('pendingOrder', JSON.stringify(orderData));

    // Navigate to payment page
    navigate('/payment');
  };

  // Format address for order
  const formatAddressForOrder = (address) => {
    let formatted = `${address.name}, ${address.phone}\n`;
    formatted += `${address.address_line_1}`;
    if (address.address_line_2) {
      formatted += `, ${address.address_line_2}`;
    }
    if (address.landmark) {
      formatted += `, Near ${address.landmark}`;
    }
    formatted += `\n${address.city}, ${address.state} - ${address.pincode}`;
    return formatted;
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center text-gray-600 hover:text-pink-600 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to Cart
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Address & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <FaMapMarkerAlt className="mr-3 text-pink-500" />
                  Delivery Address
                </h2>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center text-pink-600 hover:text-pink-700 font-medium"
                >
                  <FaPlus className="mr-1 text-sm" />
                  Add New
                </button>
              </div>

              {/* Address List */}
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedAddress?.id === address.id
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAddress(address)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-gray-900">{address.name}</span>
                          <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {address.address_type}
                          </span>
                          {address.is_default && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-1">{address.phone}</p>
                        <p className="text-gray-700">
                          {address.address_line_1}
                          {address.address_line_2 && `, ${address.address_line_2}`}
                          {address.landmark && `, Near ${address.landmark}`}
                        </p>
                        <p className="text-gray-700">
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                      </div>
                      {selectedAddress?.id === address.id && (
                        <FaCheck className="text-pink-500 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {addresses.length === 0 && (
                <div className="text-center py-8">
                  <FaMapMarkerAlt className="mx-auto text-4xl text-gray-300 mb-4" />
                  <p className="text-gray-600 mb-4">No addresses found</p>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    Add Your First Address
                  </button>
                </div>
              )}
            </motion.div>



            {/* Order Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Notes (Optional)</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions for delivery..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                rows="3"
                maxLength="500"
              />
              <p className="text-sm text-gray-500 mt-2">{notes.length}/500 characters</p>
            </motion.div>

            {/* Payment Method Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FaCreditCard className="mr-3 text-pink-500" />
                Payment Method
              </h2>
              <div className="flex flex-col items-start">
                <PaymentButton amount={total} />
              </div>
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6 sticky top-8"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FaShoppingCart className="mr-3 text-pink-500" />
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.image || item.images?.[0] || "https://via.placeholder.com/60x60"}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded border"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pt-4 border-t">
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

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={!selectedAddress || placing}
                className="w-full bg-pink-500 text-white py-4 rounded-lg font-semibold hover:bg-pink-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {placing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <FaShoppingCart />
                    <span>Place Order</span>
                  </>
                )}
              </button>

              {/* Security Info */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  🔒 Your payment information is secure and encrypted
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Add Address Modal */}
        {showAddressForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Address</h3>

              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({...addressForm, name: e.target.value})}
                    className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                    className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>

                <input
                  type="text"
                  placeholder="Address Line 1"
                  value={addressForm.address_line_1}
                  onChange={(e) => setAddressForm({...addressForm, address_line_1: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />

                <input
                  type="text"
                  placeholder="Address Line 2 (Optional)"
                  value={addressForm.address_line_2}
                  onChange={(e) => setAddressForm({...addressForm, address_line_2: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                    className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                    className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                    className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                  <select
                    value={addressForm.address_type}
                    onChange={(e) => setAddressForm({...addressForm, address_type: e.target.value})}
                    className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="home">Home</option>
                    <option value="office">Office</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Landmark (Optional)"
                  value={addressForm.landmark}
                  onChange={(e) => setAddressForm({...addressForm, landmark: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={addressForm.is_default}
                    onChange={(e) => setAddressForm({...addressForm, is_default: e.target.checked})}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-700">Set as default address</span>
                </label>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-pink-500 text-white py-3 rounded-lg font-medium hover:bg-pink-600 transition-colors"
                  >
                    Add Address
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
