import { Routes, Route } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import CompleteProfilePage from "../pages/CompleteProfilePage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import AdminMenuPage from "../pages/AdminMenuPage";
import AdminUserManagementPage from "../pages/AdminUserManagementPage";
import AdminAnalyticsPage from "../pages/AdminAnalyticsPage";
import AdminSettingsPage from "../pages/AdminSettingsPage";
import PlayerDashboardPage from "../pages/PlayerDashboardPage";
import PlayerSettingsPage from "../pages/PlayerSettingsPage";
import AgentDashboard from "../pages/AgentDashboardPage";
import AgentSettingsPage from "../pages/AgentSettingsPage";
import RoleBasedRoute from "../components/RoleBasedRoute";
import ProfileCompletionGuard from "../components/ProfileCompletionGuard";

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* Player only route - for completing profile */}
      {/* Only accessible by players who haven't completed their profile */}
      <Route 
        path="/complete-profile" 
        element={
          <ProfileCompletionGuard>
            <CompleteProfilePage />
          </ProfileCompletionGuard>
        } 
      />
      
      {/* Admin only routes */}
      <Route 
        path="/admin/dashboard" 
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <AdminDashboardPage />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path="/admin/menu" 
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <AdminMenuPage />
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
      <Route 
        path="/admin/settings" 
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <AdminSettingsPage />
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
      <Route 
        path="/player/settings" 
        element={
          <RoleBasedRoute allowedRoles={["player"]}>
            <PlayerSettingsPage />
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
      <Route 
        path="/agent/settings" 
        element={
          <RoleBasedRoute allowedRoles={["agent"]}>
            <AgentSettingsPage />
          </RoleBasedRoute>
        } 
      />
    </Routes>
  );
}

export default AppRoutes;