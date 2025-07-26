import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import wishlistService from '../services/wishlistService';
import cartService from '../services/cartService';

const Wishlist = () => {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    }
  }, [isAuthenticated]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistService.getWishlist();
      setWishlistItems(response.data.items || []);
    } catch (error) {
      setError('Failed to load wishlist');
      console.error('Load wishlist error:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistItemId) => {
    try {
      await wishlistService.removeFromWishlist(wishlistItemId);
      await loadWishlist(); // Reload wishlist after removal
    } catch (error) {
      setError('Failed to remove item from wishlist');
      console.error('Remove from wishlist error:', error);
    }
  };

  const moveToCart = async (wishlistItemId) => {
    try {
      await wishlistService.moveToCart(wishlistItemId);
      await loadWishlist(); // Reload wishlist after moving to cart
      alert('Item moved to cart successfully!');
    } catch (error) {
      setError('Failed to move item to cart');
      console.error('Move to cart error:', error);
    }
  };

  const addToCart = async (productId) => {
    try {
      await cartService.addToCart(productId, 1);
      alert('Item added to cart successfully!');
    } catch (error) {
      setError('Failed to add item to cart');
      console.error('Add to cart error:', error);
    }
  };

  const clearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      try {
        await wishlistService.clearWishlist();
        setWishlistItems([]);
        alert('Wishlist cleared successfully!');
      } catch (error) {
        setError('Failed to clear wishlist');
        console.error('Clear wishlist error:', error);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please login to view your wishlist</h2>
          <p className="text-gray-600">You need to be logged in to access your wishlist.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Wishlist</h1>
          {wishlistItems.length > 0 && (
            <button
              onClick={clearWishlist}
              className="mt-4 sm:mt-0 text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          )}
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💝</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Save your favorite products here!</p>
            <a 
              href="/" 
              className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Product Image */}
                <div className="relative">
                  <div className="w-full h-48 bg-gray-200 overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <img 
                        src={item.images[0]} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-red-500 hover:text-red-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Product Details */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{item.name}</h3>
                  
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-lg font-bold text-pink-600">₹{item.price}</p>
                    <span className="text-sm text-gray-500">
                      Stock: {item.stock_quantity || 0}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => moveToCart(item.id)}
                      className="flex-1 bg-pink-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors"
                    >
                      Move to Cart
                    </button>
                    <button
                      onClick={() => addToCart(item.product_id)}
                      className="flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {wishlistItems.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-gray-600">
                  {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Total value: ₹{wishlistItems.reduce((sum, item) => sum + item.price, 0)}
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <button
                  onClick={() => {
                    const productIds = wishlistItems.map(item => item.product_id);
                    productIds.forEach(productId => addToCart(productId));
                  }}
                  className="bg-pink-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-pink-600 transition-colors"
                >
                  Add All to Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist; 