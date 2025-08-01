import React from 'react';
import api from '../../services/api';

const PaymentButton = ({ amount = 100, order_id }) => {
  const handlePayment = async () => {
    try {
      // 1. Backend se order create karo - correct URL and auth
      const { data } = await api.post('/payments/create-order', { 
        amount, 
        order_id: order_id || Date.now() // Use integer timestamp
      });
      
      const order = data.order;

      // 2. Razorpay options set karo
      const options = {
        key: data.key,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        handler: async function (response) {
          try {
            // Verify payment with backend
            const verifyData = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: order_id
            });
            
            if (verifyData.data.success) {
              alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
            } else {
              alert('Payment verification failed!');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed!');
          }
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#3399cc'
        }
      };

      // 3. Razorpay checkout open karo
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
  };

  // Razorpay script loader
  React.useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return <button onClick={handlePayment} style={{padding: '10px 20px', background: '#3399cc', color: '#fff', border: 'none', borderRadius: '4px'}}>Pay with Razorpay</button>;
};

export default PaymentButton; 
