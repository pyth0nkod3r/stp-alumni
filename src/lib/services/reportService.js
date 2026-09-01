import api from '../api/axios';

const reportService = {
  /**
   * Report a post (User)
   * @param {string} postId
   * @param {Object} data - { reason: string, description?: string }
   */
  reportPost: async (postId, data) => {
    const response = await api.post(`/posts/${postId}/report`, data);
    return response.data;
  },
};

export default reportService;

