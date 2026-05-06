import api from '../api/axios';

const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  forgotPassword: async (emailAddress) => {
    const response = await api.post('/auth/forgot-password', emailAddress);
    return response.data;
  },

  verifyResetToken: async (token) => {
    const response = await api.post('/auth/verify-reset-token', { token });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};

export default authService;
