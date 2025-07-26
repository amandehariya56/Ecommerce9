import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import cartService from '../../services/cartService';
import wishlistService from '../../services/wishlistService';
import { FaShoppingCart, FaHeart, FaStar, FaEye } from 'react-icons/fa';
import { BsLightningCharge } from 'react-icons/bs';
import { Link, useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const navigate = useNavigate();

  const image = product.images && product.images.length > 0 ? product.images[0] : 'https://images.meesho.com/images/products/1/1.jpg';

  const showSuccessAlert = (title, message) => {
    Swal.fire({
      title,
      text: message,
      icon: 'success',
      confirmButtonColor: '#ec4899',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const showErrorAlert = (title, message) => {
    Swal.fire({
      title,
      text: message,
      icon: 'error',
      confirmButtonColor: '#ec4899'
    });
  };

  const showLoginAlert = () => {
    Swal.fire({
      title: 'Login Required',
      text: 'Please login to continue',
      icon: 'info',
      confirmButtonColor: '#ec4899',
      confirmButtonText: 'Login Now'
    });
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showLoginAlert();
      return;
    }

    try {
      setLoading(true);
      await cartService.addToCart(product.id, 1);

      // Show success message with cart option
      Swal.fire({
        icon: 'success',
        title: 'Added to Cart!',
        text: 'Product has been added to your cart successfully',
        showCancelButton: true,
        confirmButtonText: 'View Cart',
        cancelButtonText: 'Continue Shopping',
        confirmButtonColor: '#ec4899',
        cancelButtonColor: '#6b7280'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/cart');
        }
      });
    } catch (error) {
      showErrorAlert('Error!', 'Failed to add product to cart');
      console.error('Add to cart error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWishlist = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showLoginAlert();
      return;
    }

    try {
      setWishlistLoading(true);
      await wishlistService.addToWishlist(product.id);
      setIsInWishlist(true);
      showSuccessAlert('Added to Wishlist!', 'Product has been added to your wishlist');
    } catch (error) {
      showErrorAlert('Error!', 'Failed to add product to wishlist');
      console.error('Add to wishlist error:', error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    Swal.fire({
      title: product.name,
      html: `
        <div class="text-left">
          <img src="${image}" alt="${product.name}" class="w-full h-48 object-cover rounded-lg mb-4" />
          <p class="text-lg font-bold text-pink-600 mb-2">₹${product.price}</p>
          <p class="text-gray-600 mb-2">${product.description || 'No description available'}</p>
          <p class="text-sm text-gray-500">Category: ${product.category_name || 'N/A'}</p>
          <p class="text-sm text-gray-500">Stock: ${product.quantity || 0} units</p>
        </div>
      `,
      width: '500px',
      confirmButtonColor: '#ec4899',
      confirmButtonText: 'Add to Cart'
    }).then((result) => {
      if (result.isConfirmed) {
        handleAddToCart(e);
      }
    });
  };

  return (
    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer relative border border-gray-100"
      >
        {/* Product Image - Direct Display */}
        <div className="relative overflow-hidden">
          <img
            src={image}
            alt={product.name}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
          
          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col space-y-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToWishlist}
              disabled={wishlistLoading}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                isInWishlist 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <FaHeart className={`text-sm ${isInWishlist ? 'fill-current' : ''}`} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              disabled={loading || product.quantity === 0}
              className="w-8 h-8 rounded-full bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-500 flex items-center justify-center shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaShoppingCart className="text-sm" />
            </motion.button>
          </div>

          {/* Badges */}
          {product.quantity === 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Sold Out
            </div>
          )}
          
          {product.price < 500 && (
            <div className="absolute bottom-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <BsLightningCharge />
              Deal
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4">
          <motion.h3 
            className="font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[40px] group-hover:text-pink-600 transition-colors"
            whileHover={{ color: '#ec4899' }}
          >
            {product.name}
          </motion.h3>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar key={star} className="text-yellow-400 text-xs" />
              ))}
              <span className="text-xs text-gray-500 ml-1">(4.5)</span>
            </div>
            <span className="text-xs text-gray-500">
              {product.quantity || 0} left
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-pink-600">₹{product.price}</span>
              {product.price > 1000 && (
                <span className="text-sm text-gray-400 line-through">₹{Math.round(product.price * 1.2)}</span>
              )}
            </div>
            
            {product.category_name && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {product.category_name}
              </span>
            )}
          </div>

          {/* Loading States */}
          {(loading || wishlistLoading) && (
            <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full"
              />
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard; 