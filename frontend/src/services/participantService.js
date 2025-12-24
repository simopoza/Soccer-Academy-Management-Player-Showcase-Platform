import axiosInstance from './axiosInstance';

const getParticipants = async (q = '') => {
  const params = q ? { params: { q } } : {};
  const response = await axiosInstance.get('/participants', params);
  return response.data;
};

export default { getParticipants };
