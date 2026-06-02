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
    const formData = new FormData();
    formData.append('roomName', data.name);
    formData.append('roomDescription', data.description || '');
    const response = await api.post('/dealrooms', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ─── Members ───────────────────────────────────────────────────

  addMembers: async (roomId, userIds) => {
    const response = await api.post(`/dealrooms/${roomId}/members`, {
      members: Array.isArray(userIds) ? userIds : [...userIds],
    });
    return response.data;
  },

  removeMember: async (roomId, userId) => {
    const response = await api.delete(`/dealrooms/${roomId}/members/${userId}`);
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
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
    return response.data;
  },

  getStreamUrl: (roomId, fileId) =>
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/dealrooms/${roomId}/files/${fileId}/stream`,

    // ─── NDA ───────────────────────────────────────────────────────
 
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