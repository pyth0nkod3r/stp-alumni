import api from '../api/axios';

const messagingService = {
  // ─── SHARED (all conversation types) ───────────────────────────

  /**
   * Fetch all conversations for the current user.
   * Returns DIRECT, PUBLIC_GROUP, and PRIVATE_GROUP conversations.
   */
  getConversations: async () => {
    const response = await api.get('/messaging/conversations');
    return response.data;
  },

  /**
   * Fetch paginated message history for a conversation.
   * @param {string} conversationId
   * @param {Object} params - { page, limit }
   */
  getMessages: async (conversationId, params = { page: 1, limit: 30 }) => {
    const response = await api.get(
      `/messaging/conversations/${conversationId}/messages`,
      { params }
    );
    return response.data;
  },

  /**
   * Get full details of a single conversation.
   * @param {string} conversationId
   */
  getConversationDetails: async (conversationId) => {
    const response = await api.get(`/messaging/conversations/${conversationId}`);
    return response.data;
  },

  /**
   * Send a plain text message to a conversation.
   * @param {string} conversationId
   * @param {string} content
   */
  sendMessage: async (conversationId, content) => {
    const response = await api.post(
      `/messaging/conversations/${conversationId}/messages`,
      { content }
    );
    return response.data;
  },

  /**
   * Mark a conversation as read.
   * @param {string} conversationId
   */
  markAsRead: async (conversationId) => {
    const response = await api.post(`/messaging/conversations/${conversationId}/read`);
    return response.data;
  },

  /**
   * Delete or exit an entire conversation / deal room.
   * @param {string} conversationId
   */
  deleteConversation: async (conversationId) => {
    const response = await api.delete(`/messaging/conversations/${conversationId}`);
    return response.data;
  },

  /**
   * Upload media (image/document) to a conversation.
   * Can also include a text `content` field alongside the file.
   * @param {string} conversationId
   * @param {FormData} formData - { mediaFile: File, content?: string }
   */
  uploadMedia: async (conversationId, formData) => {
    const response = await api.post(
      `/messaging/conversations/${conversationId}/media`,
      formData
    );
    return response.data;
  },

  /**
   * Delete a message (own messages only).
   * @param {string} messageId
   */
  deleteMessage: async (messageId) => {
    const response = await api.delete(`/messaging/messages/${messageId}`);
    return response.data;
  },

  // ─── DIRECT CHAT ───────────────────────────────────────────────

  /**
   * Send a direct chat invitation to another user.
   * @param {string} recipientId
   * @param {string} shortMessage
   */
  sendInvitation: async (recipientId, shortMessage) => {
    const response = await api.post('/messaging/direct/start', {
      recipientId,
      shortMessage,
    });
    return response.data;
  },

  /**
   * Get pending invitations / connection requests for the current user.
   */
  getPendingInvitations: async () => {
    const response = await api.get('/connections/requests');
    return response.data;
  },

  /**
   * Respond to an invitation / connection request.
   * @param {string} invitationId
   * @param {"accept"|"decline"|"ignore"} action
   */
  respondToInvitation: async (invitationId, action) => {
    if (action === 'accept') {
      const response = await api.put(`/connections/${invitationId}/accept`);
      return response.data;
    }
    const response = await api.put(`/connections/${invitationId}/ignore`);
    return response.data;
  },

  // ─── PUBLIC GROUPS (Network Groups) ───────────────────────────

  /**
   * Create a public group.
   * @param {Object} data - { name, description, privacyMode }
   */
  createPublicGroup: async (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('privacyMode', data.privacyMode || (data.isOpen === "0" ? "CLOSED" : "PUBLIC"));
    const response = await api.post('/network/groups', formData);
    return response.data;
  },

  /**
   * Search / list public groups.
   * @param {Object} params - { search?, page?, limit? }
   */
  searchPublicGroups: async (params = {}) => {
    const response = await api.get('/network/groups', { params });
    return response.data;
  },

  /**
   * Join a public group.
   * @param {string} groupId
   */
  joinGroup: async (groupId) => {
    const response = await api.post(`/network/groups/${groupId}/member`, {
      action: 'JOIN',
    });
    return response.data;
  },

  /**
   * Get pending join requests for a group (admin only).
   * @param {string} groupId
   */
  getJoinRequests: async (groupId) => {
    const response = await api.get(`/network/groups/${groupId}/requests`);
    return response.data;
  },

  /**
   * Respond to a join request (admin only).
   * @param {string} groupId
   * @param {string} requestId
   * @param {"approve"|"reject"} action
   */
  respondToJoinRequest: async (groupId, requestId, action) => {
    const response = await api.post(
      `/network/groups/${groupId}/requests/${requestId}/respond`,
      { action: action === "ACCEPT" ? "approve" : action === "REJECT" ? "reject" : action }
    );
    return response.data;
  },

  /**
   * Leave a group.
   * @param {string} groupId
   */
  leaveGroup: async (groupId) => {
    const response = await api.post(`/network/groups/${groupId}/member`, {
      action: 'LEAVE',
    });
    return response.data;
  },

  /**
   * Update public group settings (admin only).
   * @param {string} groupId
   * @param {Object} data - { name?, description? }
   */
  updateGroupSettings: async (groupId, data) => {
    const response = await api.patch(
      `/network/groups/${groupId}`,
      data
    );
    return response.data;
  },

  // ─── PRIVATE GROUPS (Deal Room) ────────────────────────────────

  /**
   * Create a private group (deal room).
   * @param {Object} data - { title, description }
   */
  createPrivateGroup: async (data) => {
    const response = await api.post('/dealrooms', {
      title: data.name || data.title,
      description: data.description || '',
    });
    return response.data;
  },

  /**
   * Invite a user to a private group (dealroom).
   * @param {string} roomId
   * @param {string} userId
   */
  inviteToGroup: async (roomId, userId) => {
    const response = await api.post(`/dealrooms/${roomId}/members`, {
      userIds: [userId],
    });
    return response.data;
  },

  /**
   * Remove a member from a private group (dealroom).
   * @param {string} roomId
   * @param {string} userId
   */
  removeMember: async (roomId, userId) => {
    const response = await api.delete(
      `/dealrooms/${roomId}/members/${userId}`
    );
    return response.data;
  },

  /**
   * Update private group settings.
   * @param {string} roomId
   * @param {Object} data
   */
  updatePrivateGroupSettings: async (roomId, data) => {
    const response = await api.patch(
      `/dealrooms/${roomId}`,
      data
    );
    return response.data;
  },
};

export default messagingService;
