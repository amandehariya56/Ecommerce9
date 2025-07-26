import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Buy = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
    // eslint-disable-next-line
  }, [user]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/cart');
      setCart(res.data.data || []);
    } catch {
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!address.trim()) return;
    setPlacing(true);
    try {
      await axios.post('http://localhost:5000/api/orders', { address, cart });
      alert('Order placed successfully!');
      navigate('/orders');
    } catch {
      alert('Failed to place order.');
    } finally {
      setPlacing(false);
    }
  };

  const handleQuantityChange = (productId, value) => {
    setCart(prevCart => prevCart.map(item =>
      item.product_id === productId
        ? { ...item, quantity: Math.max(1, Number(value)) }
        : item
    ));
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!cart.length) return <div className="text-center py-20 text-gray-500">No products to buy.</div>;

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="max-w-3xl mx-auto p-6 mt-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-purple-700">Checkout</h2>
      <div className="mb-8 divide-y">
        {cart.map(item => (
          <div key={item.product_id} className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg border" />
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <div className="text-gray-500 text-sm flex items-center gap-2">
                  Qty:
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => handleQuantityChange(item.product_id, e.target.value)}
                    className="w-16 px-2 py-1 border rounded text-center"
                  />
                </div>
              </div>
            </div>
            <div className="text-pink-600 font-bold">₹{item.price * item.quantity}</div>
          </div>
        ))}
      </div>
      <div className="mb-6">
        <label className="block mb-2 font-semibold text-gray-700">Delivery Address</label>
        <textarea
          value={address}
          onChange={e => setAddress(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={3}
          placeholder="Enter your address..."
        />
      </div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-xl font-bold">Total: ₹{total}</div>
        <button
          onClick={handlePlaceOrder}
          disabled={placing || !address.trim()}
          className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {placing ? 'Placing Order...' : 'Place Order'}
        </button>
    
      </div>
    </div>
  );
};

export default Buy; 