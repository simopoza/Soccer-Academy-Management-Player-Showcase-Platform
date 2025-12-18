import { Routes, Route } from "react-router-dom";
import RegisterPage from "../pages/auth/RegisterPage";
import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import CompleteProfilePage from "../pages/player/CompleteProfilePage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminMenuPage from "../pages/admin/AdminMenuPage";
import AdminUserManagementPage from "../pages/admin/AdminUserManagementPage";
import AdminAnalyticsPage from "../pages/admin/AdminAnalyticsPage";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage";
import PlayerDashboardPage from "../pages/player/PlayerDashboardPage";
import PlayerSettingsPage from "../pages/player/PlayerSettingsPage";
import AgentDashboard from "../pages/agent/AgentDashboardPage";
import AgentSettingsPage from "../pages/agent/AgentSettingsPage";
import RoleBasedRoute from "../components/routes/RoleBasedRoute";
import ProfileCompletionGuard from "../components/guards/ProfileCompletionGuard";

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