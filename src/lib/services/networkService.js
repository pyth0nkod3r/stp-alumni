import api from '../api/axios';

const networkService = {
  /**
   * Fetch the customized network users lists.
   * Includes `networkUsers`, `sameSkillUsers`, and `sameSectorUsers`.
   * @param {Object} params Optional query params like { search, industry, location }
   */
  getNetwork: async (params = {}) => {
    const response = await api.get('/connections/network', { params });
    return response.data;
  },

  /**
   * Fetch user connections
   */
  getConnections: async () => {
    const response = await api.get('/connections');
    return response.data;
  },

  /**
   * Request connection to a user
   * @param {string} connectedUserId 
   */
  connectToUser: async (data) => {
    const response = await api.post('/connections', data);
    return response.data;
  },

  /**
   * Accept an incoming connection request
   * @param {string} connectionId 
   */
  acceptConnection: async (connectionId) => {
    const response = await api.put(`/connections/${connectionId}/accept`);
    return response.data;
  },
  /**
   * ignore an incoming connection request
   * @param {string} connectionId 
   */
  ignoreConnection: async (connectionId) => {
    const response = await api.put(`/connections/${connectionId}/ignore`);
    return response.data;
  },

  getIncomingRequests: async (params = {}) => {
    const response = await api.get('/connections/requests', { params });
    return response.data;
  },

  /**
   * Disconnect / remove connection
   * @param {string} connectionId
   */
  disconnectUser: async (connectionId) => {
    const response = await api.delete(`/connections/${connectionId}`);
    return response.data;
  },
};

export default networkService;
