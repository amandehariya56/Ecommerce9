import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getAllSubcategories,
  addSubcategory,
  deleteSubcategory,
  updateSubcategory,
} from "../services/subcategoryService";
import { getAllCategories } from "../services/categoryService";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Folder,
  Package,
  AlertCircle,
  X,
  Check,
  Layers,
} from "lucide-react";

const SubcategoryPage = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", category_id: "", description: "" });
  const [editForm, setEditForm] = useState({ name: "", category_id: "", description: "" });
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [subcatRes, catRes] = await Promise.all([
        getAllSubcategories(),
        getAllCategories(),
      ]);
      const subcatData = subcatRes.data?.data || subcatRes.data || [];
      const catData = catRes.data?.data || catRes.data || [];
      setSubcategories(Array.isArray(subcatData) ? subcatData : []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (error) {
      console.error("❌ Error fetching subcategories/categories", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubcategories = subcategories.filter(subcategory =>
    subcategory.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subcategory.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subcategory.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category_id) {
      toast.warn("Please enter a subcategory name and select a category.");
      return;
    }
    
    setProcessing(true);
    try {
      const categoryId = parseInt(formData.category_id, 10);
      if (isNaN(categoryId)) {
        toast.error("Invalid Category ID selected.");
        setProcessing(false);
        return;
      }

      await addSubcategory({
        name: formData.name,
        category_id: categoryId,
        description: formData.description
      });
      toast.success("Subcategory created successfully!");
      setFormData({ name: "", category_id: "", description: "" });
      setShowCreateModal(false);
      await fetchAll();
    } catch (error) {
      console.error("Error creating subcategory:", error);
      const errorMessage = error.response?.data?.message || "Error creating subcategory.";
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.category_id) {
      toast.warn("Please enter a subcategory name and select a category.");
      return;
    }

    setProcessing(true);
    try {
      const categoryId = parseInt(editForm.category_id, 10);
      if (isNaN(categoryId)) {
        toast.error("Invalid Category ID selected.");
        setProcessing(false);
        return;
      }

      await updateSubcategory(selectedSubcategory.id, {
        name: editForm.name,
        category_id: categoryId,
        description: editForm.description
      });
      toast.success("Subcategory updated successfully!");
      setShowEditModal(false);
      setSelectedSubcategory(null);
      await fetchAll();
    } catch (error) {
      console.error("Error updating subcategory:", error);
      const errorMessage = error.response?.data?.message || "Error updating subcategory.";
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    setProcessing(true);
    try {
      await deleteSubcategory(selectedSubcategory.id);
      toast.success("Subcategory deleted successfully!");
      setShowDeleteModal(false);
      setSelectedSubcategory(null);
      await fetchAll();
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      const errorMessage = error.response?.data?.message || "Error deleting subcategory.";
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const openEditModal = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setEditForm({
      name: subcategory.name || "",
      category_id: subcategory.category_id || "",
      description: subcategory.description || ""
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setShowDeleteModal(true);
  };

  const getStats = () => {
    const totalSubcategories = subcategories.length;
    const activeSubcategories = subcategories.filter(sub => sub.status !== 'inactive').length;
    const subcategoriesWithProducts = subcategories.filter(sub => sub.product_count > 0).length;
    const uniqueCategories = new Set(subcategories.map(sub => sub.category_id)).size;
    return { totalSubcategories, activeSubcategories, subcategoriesWithProducts, uniqueCategories };
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
          <h1 className="text-3xl font-bold text-gray-900">Subcategory Management</h1>
          <p className="text-gray-600 mt-1">Organize products into subcategories</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Subcategory
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Subcategories</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubcategories}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Layers className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Subcategories</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeSubcategories}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Check className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">With Products</p>
              <p className="text-2xl font-bold text-purple-600">{stats.subcategoriesWithProducts}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Parent Categories</p>
              <p className="text-2xl font-bold text-orange-600">{stats.uniqueCategories}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Folder className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search subcategories by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Subcategories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubcategories.map((subcategory) => (
          <div key={subcategory.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Layers className="text-white" size={24} />
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => openEditModal(subcategory)} className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50" title="Edit subcategory"><Edit size={16} /></button>
                  <button onClick={() => openDeleteModal(subcategory)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50" title="Delete subcategory"><Trash2 size={16} /></button>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{subcategory.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{subcategory.description || 'No description available'}</p>
              
              <div className="mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Folder size={12} className="mr-1" />
                  {subcategory.category_name || 'No category'}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>ID: {subcategory.id}</span>
                <span className="flex items-center gap-1">
                  <Package size={14} />
                  {subcategory.product_count || 0} products
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSubcategories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
          <Layers className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No subcategories found</h3>
          <p className="mt-1 text-sm text-gray-500">{searchQuery ? 'Try adjusting your search terms.' : 'Get started by creating a new subcategory.'}</p>
        </div>
      )}

      {/* Create Subcategory Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Create New Subcategory</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter subcategory name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <select value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter subcategory description"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" disabled={processing}>Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed" disabled={processing}>{processing ? 'Creating...' : 'Create Subcategory'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subcategory Modal */}
      {showEditModal && selectedSubcategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Edit Subcategory</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <select value={editForm.category_id} onChange={e => setEditForm({ ...editForm, category_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" disabled={processing}>Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed" disabled={processing}>{processing ? 'Updating...' : 'Update Subcategory'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedSubcategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Subcategory</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">Are you sure you want to delete <strong>{selectedSubcategory.name}</strong>? This will remove the subcategory and all its products.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" disabled={processing}>Cancel</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed" disabled={processing}>{processing ? 'Deleting...' : 'Delete Subcategory'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubcategoryPage; 