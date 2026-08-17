import api from '../api/axios';

const userService = {
  getUsers: async (params) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  getUserProfileById: async (userId) => {
    const response = await api.get(`/users/${userId}/profile`);
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
  updatePreference: async (data) => {
    const response = await api.put('/users/preferences', data);
    return response.data;
  },
  uploadProfileImage: async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    const response = await api.post('/users/profile/avatar', formData);
    return response.data;
  },

  setupProfile: async (formData) => {
    const response = await api.post('/users/profile/setup', formData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  changePassword: async ({ oldPassword, newPassword }) => {
    const response = await api.post('/users/profile/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  /**
   * Deactivate current user account
   */
  deactivateAccount: async () => {
    const response = await api.delete('/users/me');
    return response.data;
  },

  /**
   * Get user's saved posts
   */
  getSavedPosts: async () => {
    const response = await api.get('/users/saved-posts');
    return response.data;
  },
};

export default userService;
