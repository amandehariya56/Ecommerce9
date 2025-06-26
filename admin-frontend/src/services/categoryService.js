// src/services/categoryService.js

import axios from "../utils/axiosInstance";

// ✅ Get all categories
export const getAllCategories = () => axios.get("/categories");

// ✅ Add category
export const addCategory = (data) => axios.post("/categories", data);

// ✅ Delete category
export const deleteCategory = (id) => axios.delete(`/categories/${id}`);

// ✅ Update category  ← Yeh missing tha
export const updateCategory = (id, data) => axios.put(`/categories/${id}`, data);
