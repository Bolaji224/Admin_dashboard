import axios from "axios";
import { getAdminToken, logoutAdmin } from "./adminAuth";

// 🔹 Admin API axios instance (NO .env)
const instance = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "secret123",
  },
});

// Request Interceptor - attach tokens
instance.interceptors.request.use((config) => {
  // Try admin token first (for admin panel)
  const adminToken = getAdminToken();
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
    return config;
  }

  // Fallback to regular user token (for candidate/employer)
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔹 Response interceptor - handle 401 errors
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If 401 Unauthorized and admin is logged in, logout admin
    if (error.response?.status === 401) {
      const adminToken = getAdminToken();
      if (adminToken) {
        // Admin token expired or invalid
        logoutAdmin();
        
        // Only redirect if we're on an admin page
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// // Optional: attach bearer token if it exists
// instance.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export default instance;
