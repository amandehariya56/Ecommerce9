import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaSave, FaTimes, FaCalendar } from 'react-icons/fa';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const Profile = () => {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    created_at: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      if (response.success) {
        setProfile(response.data);
        setEditForm({
          name: response.data.name,
          email: response.data.email
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load profile information'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      name: profile.name,
      email: profile.email
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: profile.name,
      email: profile.email
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validation
      if (!editForm.name.trim()) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Name is required'
        });
        return;
      }

      if (!editForm.email.trim()) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Email is required'
        });
        return;
      }

      const response = await authService.updateProfile(editForm);
      
      if (response.success) {
        setProfile(response.data);
        setIsEditing(false);
        
        // Update user in context if needed
        if (user) {
          const updatedUser = { ...user, ...response.data };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Profile updated successfully',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <FaUser className="text-2xl text-pink-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
                  <p className="text-pink-100">Customer Profile</p>
                </div>
              </div>
              {!isEditing && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEdit}
                  className="bg-white text-pink-600 px-6 py-2 rounded-full font-semibold hover:bg-pink-50 transition-colors flex items-center space-x-2"
                >
                  <FaEdit />
                  <span>Edit Profile</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
                
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <FaUser className="mr-2 text-pink-500" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                      {profile.name || 'Not provided'}
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <FaEnvelope className="mr-2 text-pink-500" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Enter your email address"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                      {profile.email || 'Not provided'}
                    </div>
                  )}
                </div>

                {/* Phone Field (Read-only) */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <FaPhone className="mr-2 text-pink-500" />
                    Phone Number
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                    {profile.phone || 'Not provided'}
                  </div>
                  <p className="text-xs text-gray-500">Phone number cannot be changed</p>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h2>
                
                {/* Member Since */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <FaCalendar className="mr-2 text-pink-500" />
                    Member Since
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                    {formatDate(profile.created_at)}
                  </div>
                </div>

                {/* Account Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Account Status</label>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <FaTimes />
                  <span>Cancel</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  <FaSave />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
