import axiosInstance from './axiosInstance';

const getTeams = async () => {
  const response = await axiosInstance.get('/teams');
  return response.data;
};

export default { getTeams };
