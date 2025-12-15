import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import authService from "../services/authService";

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading, updateUser } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [verifiedRole, setVerifiedRole] = useState(null);

  // Verify user role from backend on mount
  useEffect(() => {
    const verifyRole = async () => {
      if (!isAuthenticated || loading) {
        setVerifying(false);
        return;
      }

      try {
        // Fetch real user data from backend
        const response = await authService.getMe();
        const verifiedUser = response.user;
        
        // Update context with verified data
        updateUser(verifiedUser);
        setVerifiedRole(verifiedUser.role);
      } catch (error) {
        console.error("Error verifying role:", error);
        // If verification fails, treat as unauthenticated
        setVerifiedRole(null);
      } finally {
        setVerifying(false);
      }
    };

    verifyRole();
  }, [isAuthenticated, loading]);

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

  // Check if verified role is in the allowed roles
  if (!allowedRoles.includes(verifiedRole)) {
    // Redirect to their appropriate dashboard
    const redirectMap = {
      admin: "/admin-dashboard",
      agent: "/agent-dashboard",
      player: "/player-dashboard",
    };

    const redirectPath = redirectMap[verifiedRole] || "/login";
    return <Navigate to={redirectPath} replace />;
  }

  // Render the protected component
  return children;
};

export default RoleBasedRoute;
