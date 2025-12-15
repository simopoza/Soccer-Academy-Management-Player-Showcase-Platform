import axiosInstance from "./axiosInstance";

const register = async (userData) => {
  const response = await axiosInstance.post("/auth/register", userData);
  return response.data;
};

const login = async (userData) => {
  const response = await axiosInstance.post("/auth/login", userData);
  return response.data;
};

const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

const forgotPassword = async (data) => {
  const response = await axiosInstance.post("/auth/forgot-password", data);
  return response.data;
};

const verifyResetToken = async (token) => {
  const response = await axiosInstance.get(`/auth/verify-reset-token/${token}`);
  return response.data;
};

const resetPassword = async (data) => {
  const response = await axiosInstance.post("/auth/reset-password", data);
  return response.data;
};

const getMe = async () => {
  const response = await axiosInstance.get("/auth/me");
  return response.data;
};

export default { register, login, logout, forgotPassword, verifyResetToken, resetPassword, getMe };