import axiosInstance from "./axiosInstance";

const getTeams = async () => {
  const response = await axiosInstance.get("/teams");
  return response.data;
};

const getCurrentPlayer = async () => {
  const response = await axiosInstance.get("/players/me");
  return response.data;
};

const completeProfile = async (playerId, profileData) => {
  const response = await axiosInstance.put(`/players/${playerId}/complete-profile`, profileData);
  return response.data;
};

export default { getTeams, getCurrentPlayer, completeProfile };
