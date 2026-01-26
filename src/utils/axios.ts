import axios from "axios";

// 🔹 API key version (no cookies)
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL + "/api"
  : "http://localhost:8000/api",
  withCredentials: false, // don't send cookies
  headers: {
    "x-api-key": "secret123", // API key for admin middleware
  },
});

// Optional: If you want to override per-request headers later
instance.interceptors.request.use((config) => {
  // If you have token in localStorage for something else
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
