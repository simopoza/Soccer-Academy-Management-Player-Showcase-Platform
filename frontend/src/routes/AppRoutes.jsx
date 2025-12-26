import { Routes, Route } from "react-router-dom";
import RegisterPage from "../pages/auth/RegisterPage";
import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import CompleteProfilePage from "../pages/player/CompleteProfilePage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminPlayersPage from "../pages/admin/AdminPlayersPage";
import AdminTeamsPage from "../pages/admin/AdminTeamsPage";
import AdminMatchesPage from "../pages/admin/AdminMatchesPage";
import AdminStatsPage from "../pages/admin/AdminStatsPage";
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
      {/* legacy /admin/users route removed - use users-management instead */}
      {/* Admin menu and standalone analytics page removed (use dashboard/stats pages) */}
      <Route 
        path="/admin/settings" 
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <AdminSettingsPage />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path="/admin/users-management" 
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <AdminUsersPage />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path="/admin/players-management" 
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <AdminPlayersPage />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path="/admin/teams-management" 
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <AdminTeamsPage />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path="/admin/matches-management" 
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <AdminMatchesPage />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path="/admin/analytics" 
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <AdminStatsPage />
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