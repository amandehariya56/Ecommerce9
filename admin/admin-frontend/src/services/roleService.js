import axiosInstance from "../utils/axiosInstance";

export const getAllRoles = () => axiosInstance.get("/roles");
export const addRole = (data) => axiosInstance.post("/roles", data);
export const deleteRole = (id) => axiosInstance.delete(`/roles/${id}`);
// src/services/roleService.js
export const updateRole = (id, data) => axiosInstance.put(`/roles/${id}`, data);
