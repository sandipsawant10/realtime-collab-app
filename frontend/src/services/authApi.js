import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const register = async (username, email, password) => {
  try {
    const response = await axiosInstance.post("/register", {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    const errorMsg =
      error.response?.data?.message || error.message || "Registration failed";
    throw new Error(errorMsg);
  }
};

const login = async (email, password) => {
  try {
    const response = await axiosInstance.post("/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    const errorMsg =
      error.response?.data?.message || error.message || "Login failed";
    throw new Error(errorMsg);
  }
};

const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

const getToken = () => {
  const token = localStorage.getItem("token");
  return token ? token : null;
};

export { register, login, logout, getToken };
