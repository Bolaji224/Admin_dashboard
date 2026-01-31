import axios from "axios";

// 🔹 Admin API axios instance (NO .env)
const instance = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "secret123",
  },
});

// 🔹 Optional: attach bearer token if it exists
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
