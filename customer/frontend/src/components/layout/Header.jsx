import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaHeart, FaBox, FaSearch, FaBell } from 'react-icons/fa';
import { BsLightningCharge } from 'react-icons/bs';
import { useAuth } from '../../context/AuthContext';

const categories = [
  'Women Ethnic', 'Women Western', 'Men', 'Kids', 'Home & Kitchen', 'Beauty & Health', 'Jewellery & Accessories', 'Bags & Footwear', 'Electronics'
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-[#f43397] text-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <BsLightningCharge className="text-3xl text-yellow-400" />
          <span className="text-2xl font-bold tracking-tight">meesho</span>
        </Link>
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="hover:underline font-medium">Home</Link>
          <div className="relative group">
            <button className="font-medium hover:underline">Categories</button>
            <div className="absolute left-0 mt-2 w-56 bg-white text-[#333] rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-20">
              {categories.map((cat) => (
                <div key={cat} className="px-4 py-2 hover:bg-[#f8f8f8] cursor-pointer text-sm">{cat}</div>
              ))}
            </div>
          </div>
          <Link to="/cart" className="flex items-center space-x-1 font-medium hover:underline">
            <FaShoppingCart size={20} />
            <span>Cart</span>
          </Link>
          {user ? (
            <>
              <Link to="/wishlist" className="flex items-center space-x-1 font-medium hover:underline">
                <FaHeart size={20} />
                <span>Wishlist</span>
              </Link>
              <Link to="/orders" className="flex items-center space-x-1 font-medium hover:underline">
                <FaBox size={20} />
                <span>Orders</span>
              </Link>
              <div className="relative group">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <FaUser size={20} />
                  <span className="font-medium">{user.name}</span>
                </div>
                <div className="absolute right-0 mt-2 w-48 bg-white text-[#333] rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-20">
                  <Link to="/profile" className="block px-4 py-2 hover:bg-[#f8f8f8] text-sm">
                    <FaUser className="inline mr-2" />
                    My Profile
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-[#f8f8f8] text-sm text-red-600">
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <Link to="/register" className="ml-2 px-4 py-1 rounded bg-white text-[#f43397] font-semibold hover:bg-[#f8f8f8]">Sign Up</Link>
          )}
        </nav>
        {/* Mobile Menu Button */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
          {isMenuOpen ? <FaTimes size={28} /> : <FaBars size={28} />}
        </button>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white text-[#333]">
          <div className="flex flex-col px-4 py-2 space-y-2">
            <Link to="/" className="py-2 font-medium" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <div className="font-medium py-2">Categories</div>
            <div className="flex flex-wrap gap-2 pb-2">
              {categories.map((cat) => (
                <div key={cat} className="px-3 py-1 bg-[#f8f8f8] rounded text-sm">{cat}</div>
              ))}
            </div>
            <Link to="/cart" className="py-2 font-medium flex items-center space-x-1" onClick={() => setIsMenuOpen(false)}>
              <FaShoppingCart size={20} />
              <span>Cart</span>
            </Link>
            {user ? (
              <>
                <Link to="/wishlist" className="py-2 font-medium flex items-center space-x-1" onClick={() => setIsMenuOpen(false)}>
                  <FaHeart size={20} />
                  <span>Wishlist</span>
                </Link>
                <Link to="/orders" className="py-2 font-medium flex items-center space-x-1" onClick={() => setIsMenuOpen(false)}>
                  <FaBox size={20} />
                  <span>Orders</span>
                </Link>
                <Link to="/profile" className="py-2 font-medium flex items-center space-x-1" onClick={() => setIsMenuOpen(false)}>
                  <FaUser size={20} />
                  <span>Profile</span>
                </Link>
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="py-2 font-medium text-[#f43397]">Logout</button>
              </>
            ) : (
              <Link to="/register" className="py-2 font-medium text-[#f43397]" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 