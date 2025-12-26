import { Navigate } from 'react-router-dom';

// AdminMenuPage removed — redirect to admin dashboard
const AdminMenuPage = () => {
  return <Navigate to="/admin/dashboard" replace />;
};

export default AdminMenuPage;
