import axios from "../utils/axiosInstance";  // ✅ Use your axios instance

const login = (email, password, rememberMe) => {
  return axios.post("/auth/login", {
    email,
    password,
    rememberMe,
  });
};

const logout = () => {
  localStorage.removeItem("token"); // ✅ Clear token client side
  return axios.post("/auth/logout"); // ✅ Notify backend to blacklist it
};

const validateToken = () => {
  return axios.post("/auth/validate-token");
};

export default { login, logout, validateToken };
