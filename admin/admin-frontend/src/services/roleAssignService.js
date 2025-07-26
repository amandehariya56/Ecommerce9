import axiosInstance from '../utils/axiosInstance';

// Get all role assignments
export const getAllAssignedRoles = async () => {
  const response = await axiosInstance.get('/user-roles/');
  return response;
};

// Create role assignment
export const createRoleAssignment = async (data) => {
  const requestData = {
    userId: data.user_id,
    roleId: data.role_id
  };
  const response = await axiosInstance.post('/user-roles/assign', requestData);
  return response;
};

// Update role assignment
export const updateRoleAssignment = async (data) => {
  const requestData = {
    userId: data.user_id,
    oldRoleId: data.old_role_id,
    newRoleId: data.new_role_id
  };
  const response = await axiosInstance.put('/user-roles/update', requestData);
  return response;
};

// Remove role assignment
export const removeRoleAssignment = async (userId, roleId) => {
  try {
    const response = await axiosInstance.delete(`/user-roles/${userId}/${roleId}`);
    return response;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please login again.');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. Admin privileges required.');
    } else if (error.response?.status === 404) {
      throw new Error('Role assignment not found.');
    }
    throw error;
  }
};

// Get user roles
export const getUserRoles = async (userId) => {
  const response = await axiosInstance.get(`/user-roles/user/${userId}`);
  return response;
};

// Get users by role
export const getUsersByRole = async (roleId) => {
  const response = await axiosInstance.get(`/user-roles/role/${roleId}`);
  return response;
}; 