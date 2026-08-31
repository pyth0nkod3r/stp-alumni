import api from '../api/axios';

// 🔴 MOCK: Replace with real API calls when backend endpoints are available
// Expected endpoints:
//   GET /notifications?page=1&limit=20 → { status: true, data: { notifications: [...], total: N, unreadCount: N } }
//   PUT /notifications/:id/read → { status: true, message: "Notification marked as read" }
//   PUT /notifications/read-all → { status: true, message: "All notifications marked as read" }
//   GET /notifications/unread-count → { status: true, data: { count: N } }

const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'CONNECTION_REQUEST',
    title: 'New Connection Request',
    message: 'Sarah Johnson wants to connect with you',
    senderId: 'user-1',
    senderName: 'Sarah Johnson',
    senderImage: null,
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    actionUrl: '/dashboard/network?active=invitation',
  },
  {
    id: 'notif-2',
    type: 'CONNECTION_ACCEPTED',
    title: 'Connection Accepted',
    message: 'Michael Chen accepted your connection request',
    senderId: 'user-2',
    senderName: 'Michael Chen',
    senderImage: null,
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    actionUrl: '/dashboard/profile/user-2',
  },
  {
    id: 'notif-3',
    type: 'POST_LIKE',
    title: 'Post Liked',
    message: 'Emma Wilson liked your post',
    senderId: 'user-3',
    senderName: 'Emma Wilson',
    senderImage: null,
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    actionUrl: '/dashboard/post/post-1',
  },
  {
    id: 'notif-4',
    type: 'POST_COMMENT',
    title: 'New Comment',
    message: 'David Brown commented on your post: "Great insight!"',
    senderId: 'user-4',
    senderName: 'David Brown',
    senderImage: null,
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    actionUrl: '/dashboard/post/post-2',
  },
  {
    id: 'notif-5',
    type: 'EVENT_REGISTRATION',
    title: 'Event Registration',
    message: 'Lisa Park registered for your event "Tech Summit 2026"',
    senderId: 'user-5',
    senderName: 'Lisa Park',
    senderImage: null,
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    actionUrl: '/dashboard/events/event-1',
  },
  {
    id: 'notif-6',
    type: 'EVENT_UPDATE',
    title: 'Event Updated',
    message: 'The event "AI Workshop" has been updated with a new time',
    senderId: 'user-6',
    senderName: 'Event Organizer',
    senderImage: null,
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    actionUrl: '/dashboard/events/event-2',
  },
];

let mockNotifications = [...MOCK_NOTIFICATIONS];

const notificationService = {
  getNotifications: async (params = {}) => {
    // 🔴 MOCK: Replace with: const response = await api.get('/notifications', { params }); return response.data;
    await new Promise(resolve => setTimeout(resolve, 500));
    const page = params.page || 1;
    const limit = params.limit || 20;
    const start = (page - 1) * limit;
    const notifications = mockNotifications.slice(start, start + limit);
    const unreadCount = mockNotifications.filter(n => !n.isRead).length;
    return { status: true, data: { notifications, total: mockNotifications.length, unreadCount } };
  },

  markAsRead: async (notificationId) => {
    // 🔴 MOCK: Replace with: const response = await api.put(`/notifications/${notificationId}/read`); return response.data;
    await new Promise(resolve => setTimeout(resolve, 300));
    mockNotifications = mockNotifications.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
    return { status: true, message: 'Notification marked as read' };
  },

  markAllAsRead: async () => {
    // 🔴 MOCK: Replace with: const response = await api.put('/notifications/read-all'); return response.data;
    await new Promise(resolve => setTimeout(resolve, 300));
    mockNotifications = mockNotifications.map(n => ({ ...n, isRead: true }));
    return { status: true, message: 'All notifications marked as read' };
  },

  getUnreadCount: async () => {
    // 🔴 MOCK: Replace with: const response = await api.get('/notifications/unread-count'); return response.data;
    await new Promise(resolve => setTimeout(resolve, 200));
    const count = mockNotifications.filter(n => !n.isRead).length;
    return { status: true, data: { count } };
  },
};

export default notificationService;
