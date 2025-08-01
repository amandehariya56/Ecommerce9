import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import cartService from '../services/cartService';
import wishlistService from '../services/wishlistService';
import { 
  FaShoppingCart, 
  FaHeart, 
  FaStar, 
  FaTruck, 
  FaShieldAlt, 
  FaUndo, 
  FaArrowLeft,
  FaShare,
  FaEye,
  FaMinus,
  FaPlus
} from 'react-icons/fa';
import { BsLightningCharge } from 'react-icons/bs';
import axios from 'axios';
import axiosInstance from '../utils/axiosInstance';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      // Fetch product details
      const productResponse = await axiosInstance.get(`/products/${id}`);
      if (!productResponse.data || !productResponse.data.data) {
        throw new Error('No product data received');
      }
      const productData = productResponse.data.data;
      // Parse images if it's a string
      let images = [];
      if (productData.images) {
        if (typeof productData.images === 'string') {
          try {
            images = JSON.parse(productData.images);
          } catch {
            images = productData.images.split(',').map(url => url.trim()).filter(url => url);
          }
        } else if (Array.isArray(productData.images)) {
          images = productData.images;
        }
      }
      setProduct({ ...productData, images });
      // Fetch related products (same category)
      if (productData.category_id) {
        try {
          const relatedResponse = await axiosInstance.get(`/products?category_id=${productData.category_id}`);
          const relatedData = relatedResponse.data.data || relatedResponse.data || {};
          const relatedProductsArr = Array.isArray(relatedData.products) ? relatedData.products : [];
          const filteredRelated = relatedProductsArr.filter(p => p.id !== parseInt(id)).slice(0, 4);
          setRelatedProducts(filteredRelated);
        } catch (relatedError) {
          setRelatedProducts([]);
        }
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      setProduct(null);
      Swal.fire({
        title: 'Error!',
        text: error?.response?.data?.message || error.message || 'Failed to load product details',
        icon: 'error',
        confirmButtonColor: '#ec4899'
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      showLoginAlert();
      return;
    }

    if (quantity > product.stock_quantity) {
      showErrorAlert('Error!', 'Quantity exceeds available stock');
      return;
    }

    try {
      setCartLoading(true);
      await cartService.addToCart(product.id, quantity);
      showSuccessAlert('Added to Cart!', `${quantity} item(s) added to your cart`);
    } catch (error) {
      showErrorAlert('Error!', 'Failed to add product to cart');
      console.error('Add to cart error:', error);
    } finally {
      setCartLoading(false);
    }
  };

  const handleAddToWishlist = async () => {
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

  const handleQuantityChange = (action) => {
    if (action === 'increase' && quantity < product.stock_quantity) {
      setQuantity(quantity + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this amazing product: ${product.name}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showSuccessAlert('Link Copied!', 'Product link copied to clipboard');
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      showLoginAlert();
      return;
    }
    if (quantity > product.stock_quantity) {
      showErrorAlert('Error!', 'Quantity exceeds available stock');
      return;
    }
    try {
      setCartLoading(true);
      await cartService.addToCart(product.id, quantity);
      navigate('/cart');
    } catch (error) {
      showErrorAlert('Error!', 'Failed to add product to cart');
      console.error('Buy now error:', error);
    } finally {
      setCartLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!product && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found or Unavailable</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const mainImage = images[selectedImage] || 'https://images.meesho.com/images/products/1/1.jpg';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-pink-500 mb-6 transition-colors"
        >
          <FaArrowLeft />
          Back
        </motion.button>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index 
                        ? 'border-pink-500' 
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Product Title & Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar key={star} className="text-yellow-400" />
                  ))}
                  <span className="text-gray-600 ml-2">(4.5 • 128 reviews)</span>
                </div>
                <button
                  onClick={handleShare}
                  className="text-gray-500 hover:text-pink-500 transition-colors"
                >
                  <FaShare />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-pink-600">₹{product.price}</span>
                {product.price > 1000 && (
                  <span className="text-xl text-gray-400 line-through">₹{Math.round(product.price * 1.2)}</span>
                )}
                {product.price < 500 && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <BsLightningCharge />
                    Deal
                  </span>
                )}
              </div>
              <p className="text-green-600 font-medium">Free delivery on orders above ₹499</p>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || 'No description available for this product.'}
              </p>
            </div>

            {/* Category Info */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Category: <span className="font-medium">{product.category_name || 'N/A'}</span></span>
              {product.subcategory_name && (
                <span>Subcategory: <span className="font-medium">{product.subcategory_name}</span></span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${product.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className={`font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock_quantity > 0 ? `${product.stock_quantity} units in stock` : ''}
              </span>
            </div>

            {/* Quantity Selector */}
            {product.stock_quantity > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange('decrease')}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaMinus className="text-sm" />
                  </button>
                  <span className="w-16 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange('increase')}
                    disabled={quantity >= product.stock_quantity}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaPlus className="text-sm" />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={cartLoading || product.stock_quantity === 0}
                className="flex-1 bg-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {cartLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaShoppingCart />
                )}
                {product.stock_quantity === 0 ? '' : 'Add to Cart'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                disabled={cartLoading || product.stock_quantity === 0}
                className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {cartLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <BsLightningCharge />
                )}
                {product.stock_quantity === 0 ? '' : 'Buy Now'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToWishlist}
                disabled={wishlistLoading}
                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                  isInWishlist 
                    ? 'border-red-500 bg-red-50 text-red-500' 
                    : 'border-gray-300 hover:border-pink-300 hover:bg-pink-50'
                }`}
              >
                {wishlistLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaHeart className={isInWishlist ? 'fill-current' : ''} />
                )}
              </motion.button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <FaTruck className="text-pink-500" />
                <div>
                  <p className="font-medium text-gray-800">Free Delivery</p>
                  <p className="text-sm text-gray-600">On orders above ₹499</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaShieldAlt className="text-pink-500" />
                <div>
                  <p className="font-medium text-gray-800">Secure Payment</p>
                  <p className="text-sm text-gray-600">100% secure checkout</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaUndo className="text-pink-500" />
                <div>
                  <p className="font-medium text-gray-800">Easy Returns</p>
                  <p className="text-sm text-gray-600">30 day return policy</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaEye className="text-pink-500" />
                <div>
                  <p className="font-medium text-gray-800">Quality Assured</p>
                  <p className="text-sm text-gray-600">Best quality products</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-800">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <motion.div
                  key={relatedProduct.id}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => navigate(`/product/${relatedProduct.id}`)}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  <img
                    src={relatedProduct.images?.[0] || 'https://images.meesho.com/images/products/1/1.jpg'}
                    alt={relatedProduct.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{relatedProduct.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-pink-600">₹{relatedProduct.price}</span>
                      <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-400 text-sm" />
                        <span className="text-sm text-gray-500">4.5</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails; 