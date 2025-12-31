import axiosInstance from './axiosInstance';

const getStats = async (opts = {}) => {
  // opts can include pagination/search in future
  const params = {};
  if (opts.q) params.q = opts.q;
  if (opts.page) params.page = opts.page;
  if (opts.limit) params.limit = opts.limit;
  const response = await axiosInstance.get('/stats', { params });
  return response.data;
};

const getStatById = async (id) => {
  const response = await axiosInstance.get(`/stats/${id}`);
  return response.data;
};

const addStat = async (statData) => {
  const response = await axiosInstance.post('/stats', statData);
  return response.data;
};

const updateStat = async (id, statData) => {
  const response = await axiosInstance.put(`/stats/${id}`, statData);
  return response.data;
};

const deleteStat = async (id) => {
  const response = await axiosInstance.delete(`/stats/${id}`);
  return response.data;
};

export default { getStats, getStatById, addStat, updateStat, deleteStat };
