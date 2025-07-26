import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaShoppingCart, 
  FaHeart, 
  FaStar, 
  FaTruck, 
  FaShieldAlt, 
  FaUndo, 
  FaHeadset,
  FaFire,
  FaGift,
  FaPercent,
  FaArrowRight,
  FaPlay,
  FaPause,
  FaShoePrints
} from 'react-icons/fa';
import { BsLightningCharge, BsBagHeart } from 'react-icons/bs';
import { MdLocalOffer, MdTrendingUp } from 'react-icons/md';
import ProductCard from '../components/ui/ProductCard';
import { categoryService } from '../services/categoryService';
import { subcategoryService } from '../services/subcategoryService';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { SiNike, SiAdidas, SiPuma, SiReebok, SiUnderarmour, SiNewbalance } from 'react-icons/si';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentBrandIndex, setCurrentBrandIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [visibleCount, setVisibleCount] = useState(8);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-slide brands
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBrandIndex((prev) => (prev + 1) % brands.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch products, categories, and subcategories in parallel
      const [productsResponse, categoriesResponse, subcategoriesResponse] = await Promise.all([
        axios.get('http://localhost:5001/api/products'),
        categoryService.getAllCategories(),
        subcategoryService.getAllSubcategories()
      ]);

      console.log('Products response:', productsResponse.data);
      console.log('Categories response:', categoriesResponse);
      console.log('Subcategories response:', subcategoriesResponse);

      // Extract products array from API response
      const productsData = productsResponse.data?.data?.products || [];
      const categoriesData = categoriesResponse.data || [];
      const subcategoriesData = subcategoriesResponse.data || [];

      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setSubcategories(Array.isArray(subcategoriesData) ? subcategoriesData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
      // Set empty arrays as fallback
      setProducts([]);
      setCategories([]);
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = async (categoryId) => {
    try {
      setSelectedCategory(categoryId);
      const response = await subcategoryService.getSubcategoriesByCategory(categoryId);
      setSubcategories(response.data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const handleSubcategoryClick = (subcategoryId) => {
    navigate(`/subcategory/${subcategoryId}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Category icons mapping
  const categoryIcons = {
    'Women Ethnic': '👗',
    'Women Western': '👚',
    'Men': '👔',
    'Kids': '🧒',
    'Home & Kitchen': '🏠',
    'Home Appliances': '🔌',
    'Beauty & Health': '💄',
    'Jewellery': '💍',
    'Electronics': '📱',
    'Fashion': '👕',
    'Sports': '🏏',
    'Sports & Fitness': '🏋️',
    'Books': '📚',
    'Automotive': '🚗',
    'Footwear': '👟',
    'Bags & Luggage': '👜',
    'Toys & Games': '🧸',
    'Grocery': '🛒',
    'Stationery': '✏️',
    'Watches': '⌚',
    'Furniture': '🛋️',
    'Mobile Accessories': '🔌',
    'Appliances': '🔌',
    'Pet Supplies': '🐶',
    'Baby Care': '🍼',
    'Musical Instruments': '🎸',
    'Garden & Outdoors': '🌳',
    'Cameras': '📷',
    'Gaming': '🎮',
    'Travel': '✈️',
    'Art & Craft': '🎨',
    'Gifts': '🎁',
    'Medicines': '💊',
    'Fitness': '🏋️',
    'Tools': '🛠️',
    'Others': '🛍️'
  };

  // Category colors mapping
  const categoryColors = {
    'Women Ethnic': 'bg-pink-100',
    'Women Western': 'bg-purple-100',
    'Men': 'bg-blue-100',
    'Kids': 'bg-yellow-100',
    'Home & Kitchen': 'bg-green-100',
    'Beauty & Health': 'bg-red-100',
    'Jewellery': 'bg-indigo-100',
    'Electronics': 'bg-gray-100',
    'Fashion': 'bg-orange-100',
    'Sports': 'bg-green-200',
    'Books': 'bg-brown-100',
    'Automotive': 'bg-gray-200'
  };

  const features = [
    { icon: <FaTruck className="text-2xl" />, title: 'Free Delivery', desc: 'On orders above ₹499' },
    { icon: <FaShieldAlt className="text-2xl" />, title: 'Secure Payment', desc: '100% secure checkout' },
    { icon: <FaUndo className="text-2xl" />, title: 'Easy Returns', desc: '30 day return policy' },
    { icon: <FaHeadset className="text-2xl" />, title: '24/7 Support', desc: 'Dedicated support' }
  ];

  const offers = [
    { icon: <FaFire className="text-xl text-red-500" />, text: 'Flash Sale', discount: 'Up to 70% OFF' },
    { icon: <FaGift className="text-xl text-green-500" />, text: 'New User', discount: '₹100 OFF' },
    { icon: <FaPercent className="text-xl text-blue-500" />, text: 'Bank Offers', discount: '10% Cashback' }
  ];

  const brands = [
    { name: 'Nike', logo: <SiNike size={36} color="#111" /> },
    { name: 'Adidas', logo: <SiAdidas size={36} color="#111" /> },
    { name: 'Puma', logo: <SiPuma size={36} color="#111" /> },
    { name: 'Reebok', logo: <SiReebok size={36} color="#111" /> },
    { name: 'Under Armour', logo: <SiUnderarmour size={36} color="#111" /> },
    { name: 'New Balance', logo: <SiNewbalance size={36} color="#111" /> },
    { name: 'Vans', logo: <FaShoePrints size={36} color="#111" /> },
    { name: 'Converse', logo: <FaStar size={36} color="#111" /> }
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Hero Banner Section */}
      <motion.section 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 text-white py-16"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Shop Smart, 
                <span className="block text-yellow-300">Save Big!</span>
              </h1>
              <p className="text-xl mb-6 text-pink-100">
                Discover amazing deals on fashion, electronics, and more. 
                Quality products at unbeatable prices.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold text-lg hover:bg-pink-50 transition-colors flex items-center gap-2"
              >
                Shop Now <FaArrowRight />
              </motion.button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                    className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center"
                  >
                    <div className="text-3xl mb-2">🛍️</div>
                    <div className="text-sm font-medium">Trending</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Brands Section */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-12 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 
            variants={itemVariants}
            className="text-3xl font-bold text-center text-gray-800 mb-8"
          >
            Top Brands
          </motion.h2>
          
          <div className="relative overflow-hidden">
            <motion.div 
              className="flex space-x-8"
              animate={{ x: -currentBrandIndex * 200 }}
              transition={{ duration: 0.5 }}
            >
              {brands.map((brand, index) => (
                <motion.div
                  key={brand.name}
                  variants={itemVariants}
                  className="flex-shrink-0 w-48 h-24 bg-white rounded-xl shadow-lg flex items-center justify-center border border-gray-100"
                >
                  <div className={`w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200`}>
                    {brand.logo}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Categories Section */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-12"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 
            variants={itemVariants}
            className="text-3xl font-bold text-center text-gray-800 mb-8"
          >
            Shop by Category
          </motion.h2>
          
          {categories.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-8"
            >
              <div className="text-4xl mb-4">📂</div>
              <p className="text-gray-600">No categories available</p>
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
            >
              {categories.map((category) => {
                const iconKey = Object.keys(categoryIcons).find(
                  key => key.trim().toLowerCase() === (category.name || '').trim().toLowerCase()
                );
                const icon = iconKey ? categoryIcons[iconKey] : '🛍️';
                console.log('Category:', category.name, 'Icon:', icon);
                return (
                  <motion.div
                    key={category.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`${categoryColors[category.name] || 'bg-gray-100'} p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">
                        {icon}
                      </div>
                      <h3 className="font-semibold text-gray-800 text-sm">
                        {category.name}
                      </h3>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Subcategories */}
          {selectedCategory && subcategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Subcategories
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {subcategories.map((subcategory) => (
                  <motion.div
                    key={subcategory.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white p-3 rounded-lg shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md border border-gray-100"
                    onClick={() => handleSubcategoryClick(subcategory.id)}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🛍️</div>
                      <h4 className="font-medium text-gray-700 text-xs">
                        {subcategory.name}
                      </h4>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-12 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 
            variants={itemVariants}
            className="text-3xl font-bold text-center text-gray-800 mb-12"
          >
            Why Choose Meesho?
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center p-6 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-pink-500 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Offers Section */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-12"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 
            variants={itemVariants}
            className="text-3xl font-bold text-center text-gray-800 mb-12"
          >
            Special Offers
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offers.map((offer, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  {offer.icon}
                  <h3 className="text-lg font-semibold text-gray-800">{offer.text}</h3>
                </div>
                <p className="text-2xl font-bold text-pink-600">{offer.discount}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Products Section */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-12 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-between mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-800">Trending Products</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-pink-600 font-semibold hover:text-pink-700 transition-colors flex items-center gap-2"
            >
              View All <FaArrowRight />
            </motion.button>
          </motion.div>
          
          {error ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">😔</div>
              <p className="text-gray-600">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchData}
                className="mt-4 bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
              >
                Try Again
              </motion.button>
            </motion.div>
          ) : products.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🛍️</div>
              <p className="text-gray-600">No products available at the moment</p>
            </motion.div>
          ) : (
            <>
              <motion.div 
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              >
                {Array.isArray(products) && products.slice(0, visibleCount).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
              {Array.isArray(products) && visibleCount < products.length && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 8)}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-semibold text-lg transition-colors shadow-md"
                  >
                    More Products
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.section>

      {/* Newsletter Section */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-16 bg-gradient-to-r from-pink-500 to-purple-600 text-white"
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h2 
            variants={itemVariants}
            className="text-3xl font-bold mb-4"
          >
            Stay Updated
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-xl mb-8 text-pink-100"
          >
            Get the latest offers and updates delivered to your inbox
          </motion.p>
          <motion.div 
            variants={itemVariants}
            className="flex max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 rounded-l-full focus:outline-none focus:ring-2 focus:ring-white text-gray-800"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-white text-pink-600 rounded-r-full font-semibold hover:bg-pink-50 transition-colors"
            >
              Subscribe
            </motion.button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
