import axiosInstance from "./axiosInstance";

const updateUserProfile = async (userId, profileData) => {
  const response = await axiosInstance.put(`/users/${userId}/profile`, {
    first_name: profileData.firstName,
    last_name: profileData.lastName,
    email: profileData.email,
  });
  return response.data;
};

const updateUserPassword = async (userId, passwordData) => {
  const response = await axiosInstance.put(`/users/${userId}/password`, {
    oldPassword: passwordData.currentPassword,
    newPassword: passwordData.newPassword,
    confirmPassword: passwordData.confirmPassword,
  });
  return response.data;
};

export default { updateUserProfile, updateUserPassword };
