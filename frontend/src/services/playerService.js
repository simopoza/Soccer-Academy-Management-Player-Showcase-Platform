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

const getPlayers = async () => {
  const response = await axiosInstance.get('/players');
  return response.data;
};

const getPlayerById = async (playerId) => {
  const response = await axiosInstance.get(`/players/${playerId}`);
  return response.data;
};

const addPlayer = async (playerData) => {
  const response = await axiosInstance.post('/players', playerData);
  return response.data;
};

const adminCreatePlayer = async (playerData) => {
  const response = await axiosInstance.post('/players/admin-create', playerData);
  return response.data;
};

const updatePlayer = async (playerId, playerData) => {
  const response = await axiosInstance.put(`/players/${playerId}`, playerData);
  return response.data;
};

const deletePlayer = async (playerId) => {
  const response = await axiosInstance.delete(`/players/${playerId}`);
  return response.data;
};

export default { getTeams, getCurrentPlayer, completeProfile, getPlayers, getPlayerById, addPlayer, adminCreatePlayer, updatePlayer, deletePlayer };
