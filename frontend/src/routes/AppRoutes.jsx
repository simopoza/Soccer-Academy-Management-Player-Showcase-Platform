import { Routes, Route } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import CompleteProfilePage from "../pages/CompleteProfilePage";
import AdminDashboard from "../pages/AdminDashboardPage";
import AgentDashboard from "../pages/AgentDashboardPage";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleBasedRoute from "../components/RoleBasedRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Player only route - for completing profile */}
      <Route 
        path="/complete-profile" 
        element={
          <RoleBasedRoute allowedRoles={["player"]}>
            <CompleteProfilePage />
          </RoleBasedRoute>
        } 
      />
      
      {/* Admin only routes */}
      <Route 
        path="/admin/dashboard" 
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </RoleBasedRoute>
        } 
      />
      
      {/* Agent only routes */}
      <Route 
        path="/agent/dashboard" 
        element={
          <RoleBasedRoute allowedRoles={["agent"]}>
            <AgentDashboard />
          </RoleBasedRoute>
        } 
      />
    </Routes>
  );
}

export default AppRoutes;