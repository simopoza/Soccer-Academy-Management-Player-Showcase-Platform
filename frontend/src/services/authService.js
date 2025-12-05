import axiosInstance from "./axiosInstance";

const register = async (userData) => {
  const response = await axiosInstance.post("/auth/register", userData);
  return response.data;
};

export default { register };
