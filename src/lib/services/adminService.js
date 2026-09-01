import api from '../api/axios';

const adminService = {
  // ─── Post Moderation ──────────────────────────────────────────────
  /**
   * Fetch reported posts (Admin)
   * @param {Object} params - { page, limit }
   */
  getReportedPosts: async (params = {}) => {
    const response = await api.get('/backoffice/posts/reported', { params });
    return response.data;
  },

  /**
   * Hide a reported post (Admin)
   * @param {string} postId
   */
  hidePost: async (postId) => {
    const response = await api.patch(`/backoffice/posts/${postId}/hide`);
    return response.data;
  },

  /**
   * Unhide a reported post (Admin)
   * @param {string} postId
   */
  unhidePost: async (postId) => {
    const response = await api.patch(`/backoffice/posts/${postId}/unhide`);
    return response.data;
  },

  /**
   * Delete a post (Admin)
   * @param {string} postId
   */
  deletePost: async (postId) => {
    const response = await api.delete(`/backoffice/posts/${postId}`);
    return response.data;
  },

  // ─── Support Management ──────────────────────────────────────────
  /**
   * Fetch support messages (Admin)
   * @param {Object} params - { status: 'UNREAD'|'READ'|'RESOLVED', page, limit }
   */
  getSupportMessages: async (params = {}) => {
    const response = await api.get('/backoffice/support', { params });
    return response.data;
  },

  /**
   * Fetch unread support messages count (Admin)
   */
  getUnreadSupportCount: async () => {
    const response = await api.get('/backoffice/support/unread-count');
    return response.data;
  },

  /**
   * Update support ticket status (Admin)
   * @param {string} supportId
   * @param {'READ'|'RESOLVED'} status
   */
  updateSupportTicket: async (supportId, status) => {
    const response = await api.patch(`/backoffice/support/${supportId}`, { status });
    return response.data;
  },

  // ─── User Management ─────────────────────────────────────────────
  /**
   * Edit user details (Admin)
   * @param {string} userId
   * @param {Object} data - { firstName?: string, lastName?: string, email?: string, cohort?: string }
   */
  updateUser: async (userId, data) => {
    const response = await api.patch(`/backoffice/users/${userId}`, data);
    return response.data;
  },

  // ─── Deal Room Members ───────────────────────────────────────────
  /**
   * Get deal room members list (Admin)
   * @param {string} roomId
   */
  getDealroomMembers: async (roomId) => {
    const response = await api.get(`/backoffice/dealrooms/${roomId}/members`);
    return response.data;
  },
};

export default adminService;
