// src/services/subcategoryService.js

import axios from "../utils/axiosInstance";

export const getAllSubcategories = () => axios.get("/subcategories");

export const addSubcategory = (data) => axios.post("/subcategories", data);

export const deleteSubcategory = (id) => axios.delete(`/subcategories/${id}`);

export const updateSubcategory = (id, data) => axios.put(`/subcategories/${id}`, data);
  

