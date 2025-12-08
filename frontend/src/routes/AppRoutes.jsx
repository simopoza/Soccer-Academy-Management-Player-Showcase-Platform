import { Routes, Route } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import CompleteProfilePage from "../pages/CompleteProfilePage";
import AdminDashboard from "../pages/AdminDashboardPage";
import AgentDashboard from "../pages/AgentDashboardPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/complete-profile" element={<CompleteProfilePage />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/agent/dashboard" element={<AgentDashboard />} />
    </Routes>
  );
}

export default AppRoutes;