import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import authService from "../services/authService";

/**
 * ProfileCompletionGuard - Protects the complete-profile route
 * Only allows players with profile_completed = false to access
 * Redirects if:
 * - User is not a player
 * - Profile is already completed
 * - User is not authenticated
 */
const ProfileCompletionGuard = ({ children }) => {
  const { user, isAuthenticated, loading, updateUser } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [verifiedUser, setVerifiedUser] = useState(null);

  // Verify user data from backend on mount
  useEffect(() => {
    const verifyUser = async () => {
      // Wait for auth to finish loading
      if (loading) {
        return;
      }

      // If not authenticated after loading, stop verification
      if (!isAuthenticated) {
        setVerifying(false);
        return;
      }

      // If we already have a user from context, use it directly
      if (user) {
        setVerifiedUser(user);
        setVerifying(false);
        return;
      }

      // If no user in context but authenticated, fetch from backend
      try {
        const response = await authService.getMe();
        const backendUser = response.user;
        
        // Update context with verified data
        updateUser(backendUser);
        setVerifiedUser(backendUser);
      } catch (error) {
        console.error("Error verifying user:", error);
        setVerifiedUser(null);
      } finally {
        setVerifying(false);
      }
    };

    verifyUser();
  }, [isAuthenticated, loading, user]); // Added user back to dependencies

  // Show loading state while checking authentication or verifying
  if (loading || verifying) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !verifiedUser) {
    return <Navigate to="/login" replace />;
  }

  // Only players can access this route
  if (verifiedUser.role !== 'player') {
    const redirectMap = {
      admin: "/admin/dashboard",
      agent: "/agent/dashboard",
    };
    const redirectPath = redirectMap[verifiedUser.role] || "/login";
    return <Navigate to={redirectPath} replace />;
  }

  // If profile is already completed, redirect to player dashboard
  if (verifiedUser.profile_completed === true) {
    return <Navigate to="/player/dashboard" replace />;
  }

  // Allow access - player needs to complete profile
  return children;
};

export default ProfileCompletionGuard;
