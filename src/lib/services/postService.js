import api from '../api/axios';

const postService = {
  /**
   * Fetch all posts for the feed
   */
getPosts:async ({ page = 1, limit = 10 } = {}) => {
  const response = await api.get(`/posts?page=${page}&limit=${limit}`);
  return response.data;
},
  getPostById: async (postId) => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },
  /**
   * Fetch all newsfeed
   */
  getNewsfeed: async () => {
    const response = await api.get('/newsfeed');
    return response.data;
  },

  /**
   * Fetch current user's posts
   */
  getMyPosts: async () => {
    const response = await api.get('/users/my-posts');
    return response.data;
  },

  /**
   * Create a new post with text and optional images
   * @param {Object} postData - { body: string, images: File[] }
   */
  createPost: async (postData) => {
    const formData = new FormData();
    
    // Add text content
    formData.append('body', postData.body);
    
    // Add images if provided
    if (postData.images && postData.images.length > 0) {
      postData.images.forEach((image, index) => {
   formData.append(`postImages[]`, image);
      });
    }
    
    const response = await api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Toggle like on a post
   * @param {string} postId 
   */
  likePost: async (postId) => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },

  /**
   * Add a comment to a post
   * @param {string} postId 
   * @param {string} comment 
   */
  commentOnPost: async (postId, comment) => {
    const response = await api.post(`/posts/${postId}/comment`, {
      comment,
    });
    return response.data;
  },

  /**
   * Get all comments for a post
   * @param {string} postId 
   */
  getPostComments: async (postId) => {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
  },
};

export default postService;
