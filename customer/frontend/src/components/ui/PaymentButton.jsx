import React from 'react';
import axios from 'axios';

const PaymentButton = ({ amount = 100 }) => {
  const handlePayment = async () => {
    try {
      // 1. Backend se order create karo - correct URL
      const { data: order } = await axios.post('http://localhost:5001/api/payment/create-order', { amount });

      // 2. Razorpay options set karo
      const options = {
        key: 'rzp_test_cvqgtKzWYqo3hB',
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        handler: function (response) {
          alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
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
