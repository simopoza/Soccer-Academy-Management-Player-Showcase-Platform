import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
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

  // Check if user's role is in the allowed roles
  if (!allowedRoles.includes(user?.role)) {
    // Redirect to their appropriate dashboard
    const redirectMap = {
      admin: "/admin/dashboard",
      agent: "/agent/dashboard",
      player: "/player/profile",
    };

    const redirectPath = redirectMap[user?.role] || "/login";
    return <Navigate to={redirectPath} replace />;
  }

  // Render the protected component
  return children;
};

export default RoleBasedRoute;
