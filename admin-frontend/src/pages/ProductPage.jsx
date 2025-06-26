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
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Star,
  MessageSquare,
  AlertCircle,
  X,
  Check,
  Image as ImageIcon,
  Filter,
  Grid,
  List,
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

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    category_id: "",
    subcategory_id: "",
    images: []
  });

  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    quantity: "",
    category_id: "",
    subcategory_id: "",
    images: []
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

      // Always parse images
      const processedProducts = Array.isArray(prodData) ? prodData.map(product => ({
        ...product,
        images: getValidImageUrls(product.images)
      })) : [];

      console.log("Processed Products:", processedProducts); // DEBUG

      setProducts(processedProducts);
      setCategories(Array.isArray(catData) ? catData : []);
      setSubcategories(Array.isArray(subcatData) ? subcatData : []);
    } catch (error) {
      console.error("❌ Error fetching data", error);
      toast.error("Error loading products. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSubcategoriesForForm = (categoryId) => {
    if (!categoryId) return subcategories; // Show all subcategories if no category selected
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

  // Helper function to get valid image URLs
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

  // Helper function to get first valid image URL
  const getFirstImageUrl = (images) => {
    const validUrls = getValidImageUrls(images);
    return validUrls.length > 0 ? validUrls[0] : null;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      toast.warn("Please fill all required fields");
      return;
    }

    try {
      setProcessing(true);
      await addProduct(formData);
      toast.success("Product created successfully!");
      setFormData({
        name: "",
        price: "",
        quantity: "",
        category_id: "",
        subcategory_id: "",
        images: []
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
      await updateProduct(selectedProduct.id, editForm);
      toast.success("Product updated successfully!");
      setShowEditModal(false);
      setSelectedProduct(null);
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
      setSelectedProduct(null);
      fetchAll();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error deleting product. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name || "",
      price: product.price || "",
      quantity: product.quantity || "",
      category_id: product.category_id || "",
      subcategory_id: product.subcategory_id || "",
      images: product.images || []
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const getStats = () => {
    const totalProducts = products.length;
    const activeProducts = products.filter(prod => prod.status !== 'inactive').length;
    const totalValue = products.reduce((sum, prod) => sum + (prod.price * prod.quantity), 0);
    return { totalProducts, activeProducts, totalValue };
  };
  const stats = getStats();

  const getFilteredSubcategories = () => {
    if (!selectedCategory) return subcategories;
    return subcategories.filter(sub => sub.category_id == selectedCategory);
  };

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
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
            {/* Product Images */}
            <div className="relative h-48 bg-gray-100">
              {(() => {
                console.log("Product images:", product.images); // DEBUG
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
                <ImageIcon className="text-gray-400" size={48} />
              </div>
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {getValidImageUrls(product.images).length} images
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
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">Product ID: {product.id}</p>
              
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Create New Product</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
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
                        subcategory_id: "" // Reset subcategory when category changes
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
                  onChange={e => handleImageUrlChange(e)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Enter image URLs separated by commas" 
                />
                <p className="text-xs text-gray-500 mt-1">Upload 1 to 5 image URLs. Supported formats: JPG, PNG, GIF, WebP</p>
                
                {/* Show image preview */}
                {(() => {
                  const validImages = getValidImageUrls(formData.images);
                  return validImages.length > 0 ? (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {validImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={image} 
                            alt={`Preview ${index + 1}`} 
                            className="w-16 h-16 object-cover rounded border" 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div 
                            className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded border"
                            style={{ display: 'none' }}
                          >
                            <ImageIcon className="text-gray-400" size={20} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null;
                })()}
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" disabled={processing}>Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed" disabled={processing}>{processing ? 'Creating...' : 'Create Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Edit Product</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        subcategory_id: "" // Reset subcategory when category changes
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
                
                {/* Show existing images */}
                {(() => {
                  const validImages = getValidImageUrls(editForm.images);
                  return validImages.length > 0 ? (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {validImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={image} 
                            alt={`Product ${index + 1}`} 
                            className="w-16 h-16 object-cover rounded border" 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div 
                            className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded border"
                            style={{ display: 'none' }}
                          >
                            <ImageIcon className="text-gray-400" size={20} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null;
                })()}
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" disabled={processing}>Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed" disabled={processing}>{processing ? 'Updating...' : 'Update Product'}</button>
              </div>
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