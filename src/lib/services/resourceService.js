import api from '../api/axios';

const resourceService = {
  /**
   * Upload a new resource
   * @param {FormData} formData - including title, description, category, resourceFile
   */
  uploadResource: async (formData) => {
    const response = await api.post('/resources', formData);
    return response.data;
  },

  /**
   * Fetch resources
   * @param {Object} params Optional query params like { category, search, fileType, sortBy }
   */
  getResources: async (params = {}) => {
    const response = await api.get('/resources', { params });
    return response.data;
  },

  /**
   * Delete a resource
   * @param {string} resourceId
   */
  deleteResource: async (resourceId) => {
    const response = await api.delete(`/resources/${resourceId}`);
    return response.data;
  },

  /**
   * Download a resource
   * @param {string} resourceId
   * @param {FormData} formData (optional)
   */
  downloadResource: async (resourceId, formData) => {
    const response = await api.post(`/resources/download/${resourceId}`, formData);
    return response.data;
  },

  /**
   * Get stream URL for a video resource
   * @param {string} resourceId
   */
  getStreamUrl: (resourceId) => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'https://api.blazingtorrent.org/api';
    return `${base}/resources/${resourceId}/stream`;
  },
};

export default resourceService;
