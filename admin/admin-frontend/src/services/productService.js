// src/services/productService.js
import axios from "../utils/axiosInstance";

export const getAllProducts = () => axios.get("/products");
export const addProduct = (data) => axios.post("/products", data);
export const updateProduct = (id, data) => axios.put(`/products/${id}`, data);
export const deleteProduct = (id) => axios.delete(`/products/${id}`);
