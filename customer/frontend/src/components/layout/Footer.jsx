import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaYoutube, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaWhatsapp,
  FaTelegram,
  FaLinkedin
} from 'react-icons/fa';
import { BsLightningCharge } from 'react-icons/bs';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-pink-50 to-purple-50 border-t border-pink-100">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <BsLightningCharge className="text-2xl text-yellow-400" />
              <h3 className="text-xl font-bold text-pink-600">meesho</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              India's most loved social commerce platform. Buy and sell products at the best prices.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li><Link to="/about" className="hover:text-pink-600 transition-colors duration-200 text-sm">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-pink-600 transition-colors duration-200 text-sm">Careers</Link></li>
              <li><Link to="/press" className="hover:text-pink-600 transition-colors duration-200 text-sm">Press</Link></li>
              <li><Link to="/blog" className="hover:text-pink-600 transition-colors duration-200 text-sm">Blog</Link></li>
            </ul>
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Help & Support</h3>
            <ul className="space-y-2 text-gray-600">
              <li><Link to="/help" className="hover:text-pink-600 transition-colors duration-200 text-sm">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-pink-600 transition-colors duration-200 text-sm">Contact Us</Link></li>
              <li><Link to="/returns" className="hover:text-pink-600 transition-colors duration-200 text-sm">Returns & Refunds</Link></li>
              <li><Link to="/shipping" className="hover:text-pink-600 transition-colors duration-200 text-sm">Shipping Info</Link></li>
              <li><Link to="/track-order" className="hover:text-pink-600 transition-colors duration-200 text-sm">Track Order</Link></li>
            </ul>
          </motion.div>

          {/* Policy Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Policies</h3>
            <ul className="space-y-2 text-gray-600">
              <li><Link to="/privacy" className="hover:text-pink-600 transition-colors duration-200 text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-pink-600 transition-colors duration-200 text-sm">Terms of Service</Link></li>
              <li><Link to="/refund" className="hover:text-pink-600 transition-colors duration-200 text-sm">Refund Policy</Link></li>
              <li><Link to="/security" className="hover:text-pink-600 transition-colors duration-200 text-sm">Security</Link></li>
              <li><Link to="/cancellation" className="hover:text-pink-600 transition-colors duration-200 text-sm">Cancellation Policy</Link></li>
            </ul>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Connect With Us</h3>
            <div className="flex space-x-4 mb-6">
              <motion.a 
                href="#" 
                className="text-gray-600 hover:text-pink-600 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaFacebook size={20} />
              </motion.a>
              <motion.a 
                href="#" 
                className="text-gray-600 hover:text-pink-600 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTwitter size={20} />
              </motion.a>
              <motion.a 
                href="#" 
                className="text-gray-600 hover:text-pink-600 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaInstagram size={20} />
              </motion.a>
              <motion.a 
                href="#" 
                className="text-gray-600 hover:text-pink-600 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaYoutube size={20} />
              </motion.a>
              <motion.a 
                href="#" 
                className="text-gray-600 hover:text-pink-600 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaWhatsapp size={20} />
              </motion.a>
            </div>
            <div className="space-y-3 text-gray-600 text-sm">
              <div className="flex items-center space-x-2">
                <FaEnvelope className="text-pink-500" size={14} />
                <span>support@meesho.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaPhone className="text-pink-500" size={14} />
                <span>1800-123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaMapMarkerAlt className="text-pink-500" size={14} />
                <span>Bangalore, India</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-pink-200"
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Stay Updated</h3>
            <p className="text-gray-600 mb-4 text-sm">Get the latest offers and updates delivered to your inbox</p>
            <div className="flex max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-r-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-pink-200 bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <span className="text-sm text-gray-600">© 2024 Meesho Clone. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Secure Payment:</span>
                <div className="flex space-x-2">
                  <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">VISA</span>
                  </div>
                  <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">MC</span>
                  </div>
                  <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">UPI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 