import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import authService from "../../services/authService";

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading, updateUser } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [verifiedUser, setVerifiedUser] = useState(null);

  // Verify user role and status from backend on mount
  useEffect(() => {
    const verifyRole = async () => {
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
      if (user && !verifiedUser) {
        setVerifiedUser(user);
        setVerifying(false);
        return;
      }
      
      // If we already verified, don't re-fetch
      if (verifiedUser) {
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
        console.error("Error verifying role:", error);
        // If verification fails, treat as unauthenticated
        setVerifiedUser(null);
      } finally {
        setVerifying(false);
      }
    };

    verifyRole();
  }, [isAuthenticated, loading, updateUser, user, verifiedUser]); // Include updateUser/user/verifiedUser
  
  // Separate effect to sync user from context when it changes
  useEffect(() => {
    if (user && !loading && isAuthenticated && !verifiedUser) {
      setVerifiedUser(user);
      setVerifying(false);
    }
  }, [user, loading, isAuthenticated, verifiedUser]);

  // Show loading state while checking authentication or verifying role
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
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If verification failed or no user data
  if (!verifiedUser) {
    return <Navigate to="/login" replace />;
  }

  // Check user status (Vulnerability #4 fix)
  if (verifiedUser.status !== 'approved') {
    return <Navigate to="/login" replace />;
  }

  // Check if verified role is in the allowed roles
  if (!allowedRoles.includes(verifiedUser.role)) {
    // Redirect to their appropriate dashboard
    const redirectMap = {
      admin: "/admin/dashboard",
      agent: "/agent/dashboard",
      player: "/player/dashboard",
    };

    const redirectPath = redirectMap[verifiedUser.role] || "/login";
    return <Navigate to={redirectPath} replace />;
  }

  // For player routes (except complete-profile), check if profile is completed (Vulnerability #5 fix)
  if (verifiedUser.role === 'player' && !verifiedUser.profile_completed) {
    // Only redirect if NOT on the complete-profile page
    if (window.location.pathname !== '/complete-profile') {
      return <Navigate to="/complete-profile" replace />;
    }
  }

  // Render the protected component
  return children;
};

export default RoleBasedRoute;
