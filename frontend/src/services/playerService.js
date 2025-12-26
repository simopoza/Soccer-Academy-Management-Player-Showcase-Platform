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
  // If profileData is a FormData (multipart), send it with proper headers
  if (profileData instanceof FormData) {
    const response = await axiosInstance.put(`/players/${playerId}/complete-profile`, profileData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  const response = await axiosInstance.put(`/players/${playerId}/complete-profile`, profileData);
  return response.data;
};

const getPlayers = async (opts = {}) => {
  // opts: { page, limit, q }
  const params = {};
  if (opts.page != null) params.page = opts.page;
  if (opts.limit != null) params.limit = opts.limit;
  if (opts.q) params.q = opts.q;
  const response = await axiosInstance.get('/players', { params });
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
