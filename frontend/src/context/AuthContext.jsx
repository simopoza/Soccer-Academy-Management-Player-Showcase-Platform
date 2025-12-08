import { createContext, useState, useEffect, useContext } from "react";
import authService from "../services/authService";
import axiosInstance from "../services/axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Only check for user data (token is in httpOnly cookie)
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear invalid data
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      
      // Backend returns: { user: {...}, token: "..." }
      // Token is also set in httpOnly cookie automatically
      const { user: userData } = response;

      // Store ONLY user info (token is in httpOnly cookie - more secure!)
      localStorage.setItem("user", JSON.stringify(userData));

      // Update state
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local state (cookies cleared by backend)
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return { success: true, data: response };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed",
      };
    }
  };

  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const hasRole = (...roles) => {
    return user && roles.includes(user.role);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    updateUser,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
