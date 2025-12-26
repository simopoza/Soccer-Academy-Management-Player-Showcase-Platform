import axiosInstance from "./axiosInstance";

const getAllUsers = async (opts = {}) => {
  // opts: { page, limit, q }
  const params = {};
  if (opts.page != null) params.page = opts.page;
  if (opts.limit != null) params.limit = opts.limit;
  if (opts.q) params.q = opts.q;

  const response = await axiosInstance.get(`/users`, { params });
  return response.data;
};

const createUser = async (userData) => {
  const payload = {
    first_name: userData.firstName,
    last_name: userData.lastName,
    email: userData.email,
    password: userData.password,
    role: userData.role,
  };
  const response = await axiosInstance.post(`/users`, payload);
  return response.data;
};

const updateUserRole = async (userId, role) => {
  const response = await axiosInstance.put(`/users/${userId}`, { role });
  return response.data;
};

const deleteUser = async (userId) => {
  const response = await axiosInstance.delete(`/users/${userId}`);
  return response.data;
};

const updateUserProfile = async (userId, profileData) => {
  // If there's an image file, send multipart/form-data, otherwise send JSON
  if (profileData.imageFile) {
    const form = new FormData();
    form.append('first_name', profileData.firstName);
    form.append('last_name', profileData.lastName);
    form.append('email', profileData.email);
    form.append('image', profileData.imageFile);

    const response = await axiosInstance.put(`/users/${userId}/profile`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

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

export default { getAllUsers, createUser, updateUserRole, deleteUser, updateUserProfile, updateUserPassword };
