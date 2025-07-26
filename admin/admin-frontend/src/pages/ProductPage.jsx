import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";
import { getAllCategories } from "../services/categoryService";
import { getAllSubcategories } from "../services/subcategoryService";
import productDetailsService from "../services/productDetailsService";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Check,
  X,
  Grid,
  List,
  AlertCircle,
} from "lucide-react";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [activeTab, setActiveTab] = useState('basic');

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    category_id: "",
    subcategory_id: "",
    images: [],
    brand: "",
    model: "",
    detailed_description: "",
    features: "",
    warranty: "",
    return_policy: "",
    shipping_info: "",
    sale_price: "",
    discount_percentage: ""
  });

  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    quantity: "",
    category_id: "",
    subcategory_id: "",
    images: [],
    brand: "",
    model: "",
    detailed_description: "",
    features: "",
    warranty: "",
    return_policy: "",
    shipping_info: "",
    sale_price: "",
    discount_percentage: ""
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, subcatRes] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
        getAllSubcategories(),
      ]);

      const prodData = prodRes.data?.data || prodRes.data || [];
      const catData = catRes.data?.data || catRes.data || [];
      const subcatData = subcatRes.data?.data || subcatRes.data || [];

      const processedProducts = Array.isArray(prodData) ? prodData.map(product => ({
        ...product,
        images: getValidImageUrls(product.images)
      })) : [];

      setProducts(processedProducts);
      setCategories(Array.isArray(catData) ? catData : []);
      setSubcategories(Array.isArray(subcatData) ? subcatData : []);
    } catch (error) {
      console.error("Error fetching data", error);
      toast.error("Error loading products. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSubcategoriesForForm = (categoryId) => {
    if (!categoryId) return subcategories;
    return subcategories.filter(sub => sub.category_id == categoryId);
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.subcategory_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageUrlChange = (e, isEdit = false) => {
    const urls = e.target.value.split(',').map(url => url.trim()).filter(url => url);
    const form = isEdit ? editForm : formData;
    const setForm = isEdit ? setEditForm : setFormData;
    
    if (urls.length > 5) {
      toast.warn("Maximum 5 images allowed for a product");
      return;
    }
    
    setForm({ ...form, images: urls });
  };

  const getValidImageUrls = (images) => {
    if (!images) return [];
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) return parsed.filter(url => url && url.trim());
      } catch {
        return images.split(',').map(url => url.trim()).filter(url => url);
      }
    }
    if (Array.isArray(images)) {
      return images.filter(url => url && url.trim());
    }
    return [];
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      toast.warn("Please fill all required fields");
      return;
    }

    try {
      setProcessing(true);
      
      // Create product first
      const productResponse = await addProduct(formData);
      const productId = productResponse.data?.data?.id || productResponse.data?.id;
      
      if (!productId) {
        throw new Error("Failed to create product - no product ID returned");
      }
      
      // Create product details if any details are provided
      const hasDetails = formData.brand || formData.model || formData.detailed_description || 
                        formData.features || formData.warranty || formData.return_policy || 
                        formData.shipping_info || formData.sale_price || formData.discount_percentage;
      
      if (hasDetails) {
        try {
          const productDetails = {
            product_id: productId,
            brand: formData.brand || null,
            model: formData.model || null,
            detailed_description: formData.detailed_description || null,
            specifications: {},
            features: formData.features || null,
            warranty: formData.warranty || null,
            return_policy: formData.return_policy || null,
            shipping_info: formData.shipping_info || null,
            sale_price: formData.sale_price || null,
            discount_percentage: formData.discount_percentage || null
          };
          
          await productDetailsService.createProductDetails(productDetails);
        } catch (detailsError) {
          console.error("Error creating product details:", detailsError);
          // Don't fail the entire operation if details creation fails
          toast.warn("Product created but details could not be saved");
        }
      }
      
      toast.success("Product created successfully!");
      
      // Reset form only after successful creation
      setFormData({
        name: "",
        price: "",
        quantity: "",
        category_id: "",
        subcategory_id: "",
        images: [],
        brand: "",
        model: "",
        detailed_description: "",
        features: "",
        warranty: "",
        return_policy: "",
        shipping_info: "",
        sale_price: "",
        discount_percentage: ""
      });
      setShowCreateModal(false);
      fetchAll();
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Error creating product. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.price) {
      toast.warn("Please fill all required fields");
      return;
    }

    try {
      setProcessing(true);
      
      // Update product first
      await updateProduct(selectedProduct.id, editForm);
      
      // Update product details if any details are provided
      const hasDetails = editForm.brand || editForm.model || editForm.detailed_description || 
                        editForm.features || editForm.warranty || editForm.return_policy || 
                        editForm.shipping_info || editForm.sale_price || editForm.discount_percentage;
      
      if (hasDetails) {
        try {
          const productDetails = {
            product_id: selectedProduct.id,
            brand: editForm.brand || null,
            model: editForm.model || null,
            detailed_description: editForm.detailed_description || null,
            specifications: {},
            features: editForm.features || null,
            warranty: editForm.warranty || null,
            return_policy: editForm.return_policy || null,
            shipping_info: editForm.shipping_info || null,
            sale_price: editForm.sale_price || null,
            discount_percentage: editForm.discount_percentage || null
          };
          
          await productDetailsService.updateProductDetails(selectedProduct.id, productDetails);
        } catch (detailsError) {
          console.error("Error updating product details:", detailsError);
          // Don't fail the entire operation if details update fails
          toast.warn("Product updated but details could not be saved");
        }
      }
      
      toast.success("Product updated successfully!");
      setShowEditModal(false);
      fetchAll();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Error updating product. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setProcessing(true);
      await deleteProduct(selectedProduct.id);
      toast.success("Product deleted successfully!");
      setShowDeleteModal(false);
      fetchAll();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error deleting product. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const openEditModal = async (product) => {
    try {
      // Set basic product info first
    setEditForm({
      name: product.name || "",
      price: product.price || "",
      quantity: product.quantity || "",
      category_id: product.category_id || "",
      subcategory_id: product.subcategory_id || "",
        images: getValidImageUrls(product.images),
        brand: "",
        model: "",
        detailed_description: "",
        features: "",
        warranty: "",
        return_policy: "",
        shipping_info: "",
        sale_price: "",
        discount_percentage: ""
      });
      
      setSelectedProduct(product);
    setShowEditModal(true);
      
      // Try to get product details in background
      try {
        const detailsResponse = await productDetailsService.getProductDetails(product.id);
        const details = detailsResponse.data?.data || {};
        
        setEditForm(prev => ({
          ...prev,
          brand: details.brand || "",
          model: details.model || "",
          detailed_description: details.detailed_description || "",
          features: details.features || "",
          warranty: details.warranty || "",
          return_policy: details.return_policy || "",
          shipping_info: details.shipping_info || "",
          sale_price: details.sale_price || "",
          discount_percentage: details.discount_percentage || ""
        }));
      } catch (detailsError) {
        console.log("No product details found for product:", product.id);
        // Continue with empty details
      }
    } catch (error) {
      console.error("Error opening edit modal:", error);
      toast.error("Error loading product information");
    }
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const getStats = () => {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.quantity > 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * (p.quantity || 0)), 0);
    return { totalProducts, activeProducts, totalValue };
  };

  const getFilteredSubcategories = () => {
    if (!selectedCategory) return subcategories;
    return subcategories.filter(sub => sub.category_id == selectedCategory);
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-1">Manage your e-commerce products</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Products</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeProducts}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Check className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-purple-600">₹{stats.totalValue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products by name, category, or subcategory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSubcategory("");
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          
          <select
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!selectedCategory}
          >
            <option value="">All Subcategories</option>
            {getFilteredSubcategories().map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
          
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-48 bg-gray-100">
              {(() => {
                const validImages = getValidImageUrls(product.images);
                const firstImageUrl = validImages[0];
                return firstImageUrl ? (
                  <img
                    src={firstImageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null;
              })()}
              <div 
                className="w-full h-full flex items-center justify-center" 
                style={{ 
                  display: getValidImageUrls(product.images)[0] ? 'none' : 'flex' 
                }}
              >
                <Package className="text-gray-400" size={48} />
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Package className="text-white" size={24} />
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => openEditModal(product)} className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50" title="Edit product"><Edit size={16} /></button>
                  <button onClick={() => openDeleteModal(product)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50" title="Delete product"><Trash2 size={16} /></button>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-3">Product ID: {product.id}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">₹{product.price}</span>
                  <span className="text-sm text-gray-500">Qty: {product.quantity || 0}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{product.category_name || 'No category'}</span>
                <span>/</span>
                <span>{product.subcategory_name || 'No subcategory'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">{searchQuery || selectedCategory || selectedSubcategory ? 'Try adjusting your search terms or filters.' : 'Get started by creating a new product.'}</p>
        </div>
      )}

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Create New Product</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            
            <div className="flex border-b">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'basic'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Basic Information
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Product Details
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {activeTab === 'basic' && (
                <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter product name"
                        required
                  />
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                        required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        category_id: e.target.value,
                            subcategory_id: ""
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                  <select
                    value={formData.subcategory_id}
                    onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Subcategory</option>
                    {getFilteredSubcategoriesForForm(formData.category_id).map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Images (1-5 images)</label>
                <input 
                  type="text" 
                  value={Array.isArray(formData.images) ? formData.images.join(',') : ''} 
                      onChange={e => handleImageUrlChange(e, false)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Enter image URLs separated by commas" 
                />
                    <p className="text-xs text-gray-500 mt-1">Enter up to 5 image URLs separated by commas.</p>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" disabled={processing}>Cancel</button>
                    <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed" disabled={processing}>{processing ? 'Creating...' : 'Create Product'}</button>
                  </div>
                </div>
              )}
              
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={e => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter brand name"
                      />
                          </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={e => setFormData({ ...formData, model: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter model number"
                      />
                        </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.sale_price}
                        onChange={e => setFormData({ ...formData, sale_price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discount_percentage}
                        onChange={e => setFormData({ ...formData, discount_percentage: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                    <textarea
                      value={formData.detailed_description}
                      onChange={e => setFormData({ ...formData, detailed_description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter detailed product description..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                    <textarea
                      value={formData.features}
                      onChange={e => setFormData({ ...formData, features: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter product features (one per line)"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Warranty</label>
                      <input
                        type="text"
                        value={formData.warranty}
                        onChange={e => setFormData({ ...formData, warranty: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 1 year manufacturer warranty"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Return Policy</label>
                      <input
                        type="text"
                        value={formData.return_policy}
                        onChange={e => setFormData({ ...formData, return_policy: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 30 days return policy"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Information</label>
                    <textarea
                      value={formData.shipping_info}
                      onChange={e => setFormData({ ...formData, shipping_info: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter shipping information..."
                    />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" disabled={processing}>Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed" disabled={processing}>{processing ? 'Creating...' : 'Create Product'}</button>
              </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Edit Product</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            
            <div className="flex border-b">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'basic'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Basic Information
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Product Details
              </button>
            </div>
            
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              {activeTab === 'basic' && (
                <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                  />
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={editForm.quantity}
                    onChange={e => setEditForm({ ...editForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editForm.category_id}
                    onChange={(e) => {
                      setEditForm({ 
                        ...editForm, 
                        category_id: e.target.value,
                            subcategory_id: ""
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                  <select
                    value={editForm.subcategory_id}
                    onChange={(e) => setEditForm({ ...editForm, subcategory_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Subcategory</option>
                    {getFilteredSubcategoriesForForm(editForm.category_id).map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Images (1-5 images)</label>
                <input 
                  type="text" 
                  value={Array.isArray(editForm.images) ? editForm.images.join(',') : ''} 
                  onChange={e => handleImageUrlChange(e, true)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Enter image URLs separated by commas" 
                />
                <p className="text-xs text-gray-500 mt-1">Upload new image URLs to replace existing ones.</p>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" disabled={processing}>Cancel</button>
                    <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed" disabled={processing}>{processing ? 'Updating...' : 'Update Product'}</button>
                  </div>
                </div>
              )}
              
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                      <input
                        type="text"
                        value={editForm.brand}
                        onChange={e => setEditForm({ ...editForm, brand: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter brand name"
                      />
                          </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                      <input
                        type="text"
                        value={editForm.model}
                        onChange={e => setEditForm({ ...editForm, model: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter model number"
                      />
                        </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.sale_price}
                        onChange={e => setEditForm({ ...editForm, sale_price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.discount_percentage}
                        onChange={e => setEditForm({ ...editForm, discount_percentage: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                    <textarea
                      value={editForm.detailed_description}
                      onChange={e => setEditForm({ ...editForm, detailed_description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter detailed product description..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                    <textarea
                      value={editForm.features}
                      onChange={e => setEditForm({ ...editForm, features: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter product features (one per line)"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Warranty</label>
                      <input
                        type="text"
                        value={editForm.warranty}
                        onChange={e => setEditForm({ ...editForm, warranty: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 1 year manufacturer warranty"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Return Policy</label>
                      <input
                        type="text"
                        value={editForm.return_policy}
                        onChange={e => setEditForm({ ...editForm, return_policy: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 30 days return policy"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Information</label>
                    <textarea
                      value={editForm.shipping_info}
                      onChange={e => setEditForm({ ...editForm, shipping_info: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter shipping information..."
                    />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" disabled={processing}>Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed" disabled={processing}>{processing ? 'Updating...' : 'Update Product'}</button>
              </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">Are you sure you want to delete <strong>{selectedProduct.name}</strong>? This will permanently remove the product and all its data.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" disabled={processing}>Cancel</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed" disabled={processing}>{processing ? 'Deleting...' : 'Delete Product'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage; 