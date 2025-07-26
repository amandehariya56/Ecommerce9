import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, LogOut, Menu, X } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { getAllUsers } from "../../services/userService";
import { getAllProducts } from "../../services/productService";
import { getAllCategories } from "../../services/categoryService";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Data for search
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Fetch data for search
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, productsRes, categoriesRes] = await Promise.all([
          getAllUsers(),
          getAllProducts(),
          getAllCategories()
        ]);
        
        setUsers(usersRes.data?.data || usersRes.data || []);
        setProducts(productsRes.data?.data || productsRes.data || []);
        setCategories(categoriesRes.data?.data || categoriesRes.data || []);
      } catch (error) {
        console.error("Error fetching search data:", error);
      }
    };
    
    fetchData();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    
    const query = searchQuery.toLowerCase();
    const results = [];

    // Search in users
    users.forEach(user => {
      if (
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'user',
          id: user.user_id,
          title: user.name || user.username || `User ${user.user_id}`,
          subtitle: user.email,
          icon: '👤'
        });
      }
    });

    // Search in products
    products.forEach(product => {
      if (
        product.product_name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'product',
          id: product.product_id,
          title: product.product_name || `Product ${product.product_id}`,
          subtitle: `₹${product.price || 'N/A'}`,
          icon: '📦'
        });
      }
    });

    // Search in categories
    categories.forEach(category => {
      if (
        category.category_name?.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'category',
          id: category.category_id,
          title: category.category_name || `Category ${category.category_id}`,
          subtitle: category.description || 'No description',
          icon: '📂'
        });
      }
    });

    setSearchResults(results.slice(0, 8)); // Limit to 8 results
    setShowSearchResults(true);
    setIsSearching(false);
  }, [searchQuery, users, products, categories]);

  const handleSearchResultClick = (result) => {
    setSearchQuery("");
    setShowSearchResults(false);
    
    // Navigate based on result type
    switch (result.type) {
      case 'user':
        navigate('/users');
        break;
      case 'product':
        navigate('/products');
        break;
      case 'category':
        navigate('/categories');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowDropdown(false);
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  return (
    <nav className="bg-white shadow-sm px-4 md:px-6 py-3 flex justify-between items-center relative">
      {/* Left - Hamburger + Search */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <button className="text-gray-600 hover:text-gray-800 lg:hidden">
          <Menu size={24} />
        </button>
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users, products, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchResults(false);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2">Searching...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div>
                  {searchResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSearchResultClick(result)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                    >
                      <span className="text-xl">{result.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{result.title}</div>
                        <div className="text-sm text-gray-500">{result.subtitle}</div>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
                        {result.type}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right - Profile */}
      <div className="flex items-center gap-4">
        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
            </div>
            <span className="hidden md:block">
              {user?.name || user?.email || 'Admin'}
            </span>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || user?.email || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showDropdown || showSearchResults) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowDropdown(false);
            setShowSearchResults(false);
          }}
        />
      )}
    </nav>
  );
} 