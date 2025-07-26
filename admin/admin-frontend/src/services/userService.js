// src/services/userService.js

import axiosInstance from "../utils/axiosInstance";

// ✅ Ye sahi endpoint hai
export const createUser = (data) => axiosInstance.post("/auth/register", data);

export const getAllUsers = () => axiosInstance.get("/users");
export const updateUser = (id, data) => axiosInstance.put(`/users/${id}`, data);
export const deleteUser = (id) => axiosInstance.delete(`/users/${id}`);
