import api from '../api/axios';

// 🔴 MOCK: Replace with real API call when backend endpoint is available
// Expected endpoint: POST /posts/:postId/report
// Expected payload: { reason: "SPAM" | "HARASSMENT" | "INAPPROPRIATE" | "OTHER", description?: string }
// Expected response: { status: true, message: "Post reported successfully" }

const reportService = {
  reportPost: async (postId, data) => {
    // 🔴 MOCK: Replace with: const response = await api.post(`/posts/${postId}/report`, data); return response.data;
    await new Promise(resolve => setTimeout(resolve, 600));
    console.log('Post reported:', postId, data);
    return { status: true, message: 'Post has been reported. Our team will review it shortly.' };
  },
};

export default reportService;
