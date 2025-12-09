import axiosInstance from "./axiosInstance";

const getPendingUsers = async () => {
  const response = await axiosInstance.get("/admin/pending-users");
  return response.data;
};

const approveUser = async (userId) => {
  const response = await axiosInstance.put(`/admin/users/${userId}/approve`);
  return response.data;
};

const rejectUser = async (userId) => {
  const response = await axiosInstance.delete(`/admin/users/${userId}/reject`);
  return response.data;
};

const createAdmin = async (adminData) => {
  const response = await axiosInstance.post("/admin/users/create-admin", adminData);
  return response.data;
};

export default {
  getPendingUsers,
  approveUser,
  rejectUser,
  createAdmin,
};
