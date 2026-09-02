import api from '../api/axios';

const dealroomService = {
  // ─── Rooms ─────────────────────────────────────────────────────

  getDealrooms: async () => {
    const response = await api.get('/dealrooms');
    return response.data;
  },

  getDealroomById: async (roomId) => {
    const response = await api.get(`/dealrooms/${roomId}`);
    return response.data;
  },

  createRoom: async (data) => {
    const response = await api.post('/dealrooms', {
      roomName: data.name,
      roomDescription: data.description || '',
    });
    return response.data;
  },

  // ─── Members ───────────────────────────────────────────────────

  addMembers: async (roomId, userIds) => {
    const body = { members: userIds };
    const response = await api.post(`/dealrooms/${roomId}/members`, body);
    return response.data;
  },

  removeMember: async (roomId, userId) => {
    const response = await api.delete(`/dealrooms/${roomId}/members/${userId}`);
    return response.data;
  },

  /**
   * Fetch deal room members with metadata (Admin / Backoffice)
   * @param {string} roomId
   */
  getDealroomMembers: async (roomId) => {
    const response = await api.get(`/backoffice/dealrooms/${roomId}/members`);
    return response.data;
  },

  // ─── Messages ──────────────────────────────────────────────────

  getMessages: async (roomId, page = 1, limit = 30) => {
    const response = await api.get(`/dealrooms/${roomId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  },

  sendMessage: async (roomId, content) => {
    const response = await api.post(`/dealrooms/${roomId}/messages`, { content });
    return response.data;
  },

  deleteMessage: async (roomId, messageId) => {
    const response = await api.delete(`/dealrooms/${roomId}/messages/${messageId}`);
    return response.data;
  },

  // ─── Files ─────────────────────────────────────────────────────

  uploadFile: async (roomId, file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/dealrooms/${roomId}/files`, formData, {
      onUploadProgress,
    });
    return response.data;
  },

  /**
   * View all files in a deal room
   * @param {string} roomId
   */
  getFiles: async (roomId) => {
    const response = await api.get(`/dealrooms/${roomId}/files`);
    return response.data;
  },

  getStreamUrl: (roomId, fileId) => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'https://api.blazingtorrent.org/api';
    return `${base}/dealrooms/${roomId}/files/${fileId}/stream`;
  },

  // ─── NDA ───────────────────────────────────────────────────────

  /**
   * Get NDA text
   */
  getNdaText: async () => {
    const response = await api.get('/dealrooms/nda-text');
    return response.data;
  },

  signNda: async (roomId) => {
    const response = await api.post(`/dealrooms/${roomId}/nda-signatures`);
    return response.data;
  },

  // ─── Audit log ─────────────────────────────────────────────────

  getAuditLog: async (roomId) => {
    const response = await api.get(`/dealrooms/${roomId}/audit-log`);
    return response.data;
  },
};

export default dealroomService;