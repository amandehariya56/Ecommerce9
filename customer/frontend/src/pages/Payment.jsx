import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaCreditCard, 
  FaMoneyBillWave, 
  FaCheck, 
  FaArrowLeft,
  FaRupeeSign,
  FaShoppingBag,
  FaMapMarkerAlt
} from 'react-icons/fa';
import orderService from '../services/orderService';
import Swal from 'sweetalert2';
import PaymentButton from '../components/ui/PaymentButton';

const Payment = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    // Get pending order data from localStorage
    const pendingOrder = localStorage.getItem('pendingOrder');
    if (!pendingOrder) {
      // No pending order, redirect to cart
      navigate('/cart');
      return;
    }

    try {
      const data = JSON.parse(pendingOrder);
      setOrderData(data);
    } catch (error) {
      console.error('Error parsing order data:', error);
      navigate('/cart');
    }
  }, [navigate]);

  const handlePlaceOrder = async () => {
    if (!orderData) return;

    setPlacing(true);
    try {
      const finalOrderData = {
        ...orderData,
        payment_method: paymentMethod
      };

      // Remove cart and total from order data (not needed for API)
      delete finalOrderData.cart;
      delete finalOrderData.total;

      const response = await orderService.placeOrder(finalOrderData);
      
      if (response.success) {
        // Clear pending order from localStorage
        localStorage.removeItem('pendingOrder');
        
        Swal.fire({
          icon: 'success',
          title: 'Order Placed Successfully!',
          text: `Your order #${response.data.orderNumber} has been placed`,
          confirmButtonColor: '#ec4899',
          confirmButtonText: 'View Orders'
        }).then(() => {
          navigate('/orders');
        });
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Swal.fire({
        icon: 'error',
        title: 'Order Failed',
        text: error.response?.data?.message || 'Failed to place order'
      });
    } finally {
      setPlacing(false);
    }
  };

  const handleGoBack = () => {
    navigate('/checkout');
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-pink-600 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Address
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Payment Method</h1>
          <div></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6">
                <FaCreditCard className="mr-3 text-pink-500" />
                Choose Payment Method
              </h2>

              <div className="space-y-4">
                {/* Cash on Delivery */}
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FaMoneyBillWave className="text-green-600 text-xl" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Cash on Delivery</h3>
                        <p className="text-sm text-gray-600">Pay when you receive your order</p>
                        <p className="text-xs text-green-600 mt-1">✓ No extra charges</p>
                      </div>
                    </div>
                    {paymentMethod === 'cod' && <FaCheck className="text-pink-500" />}
                  </div>
                </div>

                {/* Online Payment */}
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    paymentMethod === 'online'
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('online')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FaCreditCard className="text-blue-600 text-xl" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Online Payment</h3>
                        <p className="text-sm text-gray-600">Pay securely with card/UPI/wallet</p>
                        <p className="text-xs text-blue-600 mt-1">✓ Instant confirmation</p>
                      </div>
                    </div>
                    {paymentMethod === 'online' && <FaCheck className="text-pink-500" />}
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <div className="mt-8">
                {paymentMethod === 'online' ? (
                  <PaymentButton amount={orderData.total} />
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="w-full bg-pink-500 text-white py-4 rounded-lg font-semibold text-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {placing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Placing Order...</span>
                      </>
                    ) : (
                      <>
                        <FaShoppingBag />
                        <span>Place Order</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6 sticky top-8"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-4">
                {orderData.cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="flex items-center text-pink-600">
                    <FaRupeeSign className="text-sm mr-1" />
                    {orderData.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-semibold text-gray-900 flex items-center mb-2">
                  <FaMapMarkerAlt className="mr-2 text-pink-500" />
                  Delivery Address
                </h4>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{orderData.shipping_address.name}</p>
                  <p>{orderData.shipping_address.address_line_1}</p>
                  {orderData.shipping_address.address_line_2 && (
                    <p>{orderData.shipping_address.address_line_2}</p>
                  )}
                  <p>
                    {orderData.shipping_address.city}, {orderData.shipping_address.state} - {orderData.shipping_address.postal_code}
                  </p>
                  <p className="mt-1">📞 {orderData.shipping_address.phone}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
