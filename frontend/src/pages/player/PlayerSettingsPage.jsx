import { useAuth } from "../../context/AuthContext";
import SettingsPage from "../../components/forms/SettingsPage";

const PlayerSettingsPage = () => {
  const { user } = useAuth();
  return <SettingsPage user={user} />;
};

export default PlayerSettingsPage;
