import { useAuth } from "../../context/AuthContext";
import SettingsPage from "../../components/forms/SettingsPage";

const AdminSettingsPage = () => {
  const { user } = useAuth();
  return <SettingsPage user={user} />;
};

export default AdminSettingsPage;
