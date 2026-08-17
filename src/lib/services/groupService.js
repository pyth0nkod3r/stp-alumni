import api from '../api/axios';

const groupService = {
  // ─── Groups ────────────────────────────────────────────────────

  getGroups: async () => {
    const response = await api.get('/network/groups');
    return response.data;
  },

  getGroupById: async (groupId) => {
    const response = await api.get(`/network/groups/${groupId}`);
    return response.data;
  },

  createGroup: async (formData) => {
    const response = await api.post('/network/groups', formData);
    return response.data;
  },

  updateGroup: async (groupId, data) => {
    const response = await api.patch(`/network/groups/${groupId}`, data);
    return response.data;
  },

  toggleMembership: async (groupId, action) => {
    const response = await api.post(`/network/groups/${groupId}/member`, { action });
    return response.data;
  },

  /**
   * Get current user's membership status in a group
   * @param {string} groupId
   */
  getMembershipStatus: async (groupId) => {
    const response = await api.get(`/network/groups/${groupId}/member`);
    return response.data;
  },

  getGroupMembers: async (groupId, page = 1, limit = 20) => {
    const response = await api.get(`/network/groups/${groupId}/members`, {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Remove member from group (group admin only)
   * @param {string} groupId
   * @param {string} userId
   */
  removeMember: async (groupId, userId) => {
    const response = await api.delete(`/network/groups/${groupId}/members/${userId}`);
    return response.data;
  },

  /**
   * Generate invite link for a group
   * @param {string} groupId
   */
  generateInviteLink: async (groupId) => {
    const response = await api.post(`/network/groups/${groupId}/invite-link`);
    return response.data;
  },

  /**
   * Join a group via invite link token
   * @param {string} token
   */
  joinViaLink: async (token) => {
    const response = await api.post('/network/groups/join-via-link', { token });
    return response.data;
  },

  /**
   * View pending join requests (group admin only)
   * @param {string} groupId
   */
  getJoinRequests: async (groupId) => {
    const response = await api.get(`/network/groups/${groupId}/requests`);
    return response.data;
  },

  /**
   * Respond to a join request (group admin only)
   * @param {string} groupId
   * @param {string} requestId
   * @param {"approve"|"reject"} action
   */
  respondToJoinRequest: async (groupId, requestId, action) => {
    const response = await api.post(
      `/network/groups/${groupId}/requests/${requestId}/respond`,
      { action }
    );
    return response.data;
  },

  /**
   * Like / unlike a group
   * @param {string} groupId
   */
  likeGroup: async (groupId) => {
    const response = await api.post(`/network/groups/${groupId}/like`);
    return response.data;
  },

  /**
   * Add a comment to a group
   * @param {string} groupId
   * @param {string} comment
   */
  commentOnGroup: async (groupId, comment) => {
    const response = await api.post(`/network/groups/${groupId}/comment`, { comment });
    return response.data;
  },

  /**
   * Get comments on a group
   * @param {string} groupId
   */
  getGroupComments: async (groupId) => {
    const response = await api.get(`/network/groups/${groupId}/comments`);
    return response.data;
  },

  // ─── Posts ─────────────────────────────────────────────────────

  getGroupPosts: async (groupId, page = 1, limit = 20) => {
    const response = await api.get(`/network/groups/${groupId}/posts`, {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Create a post in a group
   * @param {string} groupId
   * @param {string} body
   * @param {File[]} images
   * @param {File} video
   */
  createGroupPost: async (groupId, body, images = [], video = null) => {
    const formData = new FormData();
    if (body) formData.append('body', body);
    if (images && images.length > 0) {
      images.forEach((file) => formData.append('postImages[]', file));
    }
    if (video) {
      formData.append('postVideo', video);
    }
    const response = await api.post(`/network/groups/${groupId}/posts`, formData);
    return response.data;
  },

  likeGroupPost: async (groupId, postId) => {
    const response = await api.post(`/network/groups/${groupId}/posts/${postId}/like`);
    return response.data;
  },

  getPostComments: async (groupId, postId, page = 1, limit = 20) => {
    const response = await api.get(
      `/network/groups/${groupId}/posts/${postId}/comments`,
      { params: { page, limit } },
    );
    return response.data;
  },

  commentOnPost: async (groupId, postId, comment) => {
    const response = await api.post(
      `/network/groups/${groupId}/posts/${postId}/comment`,
      { comment },
    );
    return response.data;
  },

  reportGroup: async (groupId, reason, description) => {
    const response = await api.post(`/network/groups/${groupId}/reports`, {
      reason,
      description,
    });
    return response.data;
  },
};

export default groupService;