import axiosInstance from "./axiosInstance";

const getMatches = async () => {
  const response = await axiosInstance.get('/matches');
  return response.data;
};

const getMatchById = async (matchId) => {
  const response = await axiosInstance.get(`/matches/${matchId}`);
  return response.data;
};

const addMatch = async (matchData) => {
  const response = await axiosInstance.post('/matches', matchData);
  return response.data;
};

const updateMatch = async (matchId, matchData) => {
  const response = await axiosInstance.put(`/matches/${matchId}`, matchData);
  return response.data;
};

const deleteMatch = async (matchId) => {
  const response = await axiosInstance.delete(`/matches/${matchId}`);
  return response.data;
};

const opponentGoal = async (matchId, payload) => {
  const response = await axiosInstance.post(`/matches/${matchId}/opponent-goal`, payload);
  return response.data;
};

export default { getMatches, getMatchById, addMatch, updateMatch, deleteMatch, opponentGoal };
