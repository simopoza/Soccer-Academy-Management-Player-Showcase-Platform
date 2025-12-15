import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // if your backend sends cookies
});

// Request interceptor - No need to manually attach token!
// Token is automatically sent via httpOnly cookie thanks to withCredentials: true
axiosInstance.interceptors.request.use(
  (config) => {
    // Token is in httpOnly cookie - browser sends it automatically
    // This interceptor can be used for other purposes (logging, etc.)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid (httpOnly cookie)
      // Clear user UI data (cookie is cleared by backend or expired)
      localStorage.removeItem("userUI");
      
      // Redirect to login if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
