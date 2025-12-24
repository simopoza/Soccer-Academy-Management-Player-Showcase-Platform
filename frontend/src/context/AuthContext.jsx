/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user data exists in localStorage (only UI data)
        const storedUserUI = localStorage.getItem("userUI");

        if (storedUserUI) {
          // Verify with backend - fetch real user data from server
          try {
            const response = await authService.getMe();
            const verifiedUser = response.user;
            
            // Update with verified data from backend (full data in memory)
            setUser(verifiedUser);
            setIsAuthenticated(true);
            
            // Update localStorage with ONLY non-sensitive UI data
            localStorage.setItem("userUI", JSON.stringify({
              first_name: verifiedUser.first_name,
              last_name: verifiedUser.last_name,
              email: verifiedUser.email
            }));
          } catch (error) {
            console.error("Error verifying user:", error);
            // If verification fails (e.g., token expired), clear everything
            localStorage.removeItem("userUI");
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear invalid data
        localStorage.removeItem("userUI");
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

      // Store ONLY non-sensitive UI data in localStorage
      localStorage.setItem("userUI", JSON.stringify({
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email
      }));

      // Update state with full user data (in memory only)
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
      localStorage.removeItem("userUI");
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
    
    // Update localStorage with ONLY non-sensitive UI data
    localStorage.setItem("userUI", JSON.stringify({
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      email: updatedUser.email
    }));
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
