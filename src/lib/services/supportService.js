import api from '../api/axios';

const supportService = {
  /**
   * Submit a support message (User)
   * Name and email are auto-filled on server from token
   * @param {Object} data - { subject: string, message: string }
   */
  submitTicket: async (data) => {
    const payload = {
      subject: data.subject,
      message: data.message,
    };
    const response = await api.post('/support', payload);
    return response.data;
  },

  /**
   * Get all support messages (Admin / Backoffice)
   * @param {Object} params - { status: 'UNREAD'|'READ'|'RESOLVED', page, limit }
   */
  getSupportMessages: async (params = {}) => {
    const response = await api.get('/backoffice/support', { params });
    return response.data;
  },

  /**
   * Get unread support messages count (Admin / Backoffice)
   */
  getUnreadCount: async () => {
    const response = await api.get('/backoffice/support/unread-count');
    return response.data;
  },

  /**
   * Update support message status (Admin / Backoffice)
   * @param {string} supportId
   * @param {'READ'|'RESOLVED'} status
   */
  updateTicketStatus: async (supportId, status) => {
    const response = await api.patch(`/backoffice/support/${supportId}`, { status });
    return response.data;
  },
};

export default supportService;

