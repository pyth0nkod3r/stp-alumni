import api from '../api/axios';

// 🔴 MOCK: Replace with real API calls when backend endpoints are available
// Expected endpoints:
//   POST /support → { name, email, subject, message } → { status: true, message: "Support ticket submitted" }
//   GET /support/unread-count → { status: true, data: { count: N } } (admin only)

const supportService = {
  submitTicket: async (data) => {
    // 🔴 MOCK: Replace with: const response = await api.post('/support', data); return response.data;
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('Support ticket submitted:', data);
    return { status: true, message: 'Your support request has been submitted successfully. We will get back to you soon.' };
  },

  getUnreadCount: async () => {
    // 🔴 MOCK: Replace with: const response = await api.get('/support/unread-count'); return response.data;
    await new Promise(resolve => setTimeout(resolve, 300));
    return { status: true, data: { count: 3 } };
  },
};

export default supportService;
