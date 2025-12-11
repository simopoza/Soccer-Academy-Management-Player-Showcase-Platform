import { Routes, Route } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import CompleteProfilePage from "../pages/CompleteProfilePage";
import AdminDashboard from "../pages/AdminDashboardPage";
import AdminUserManagementPage from "../pages/AdminUserManagementPage";
import AdminAnalyticsPage from "../pages/AdminAnalyticsPage";
import PlayerDashboardPage from "../pages/PlayerDashboardPage";
import AgentDashboard from "../pages/AgentDashboardPage";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleBasedRoute from "../components/RoleBasedRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
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
      <Route 
        path="/admin/users" 
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <AdminUserManagementPage />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path="/admin/analytics" 
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <AdminAnalyticsPage />
          </RoleBasedRoute>
        } 
      />
      
      {/* Player only routes */}
      <Route 
        path="/player/dashboard" 
        element={
          <RoleBasedRoute allowedRoles={["player"]}>
            <PlayerDashboardPage />
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