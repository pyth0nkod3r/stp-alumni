import api from '../api/axios';

const postService = {
  /**
   * Fetch all posts for the feed
   * @param {Object} params - { page, limit, search }
   */
  getPosts: async (params = {}) => {
    const response = await api.get('/posts', { params });
    return response.data;
  },

  getPostById: async (postId) => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  /**
   * Fetch newsfeed articles
   * @param {Object} params - { category, search, page, limit }
   */
  getNewsfeed: async (params = {}) => {
    const response = await api.get('/newsfeed', { params });
    return response.data;
  },

  /**
   * Fetch current user's posts
   * @param {Object} params - { page, limit }
   */
  getMyPosts: async (params = {}) => {
    const response = await api.get('/users/my-posts', { params });
    return response.data;
  },

  /**
   * Create a new post with text, optional images and optional video
   * @param {Object} postData - { body: string, images?: File[], video?: File }
   */
  createPost: async (postData) => {
    const formData = new FormData();
    
    // Add text content
    if (postData.body) {
      formData.append('body', postData.body);
    }
    
    // Add images if provided
    const images = postData.images || postData.postImages;
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('postImages[]', image);
      });
    }

    // Add video if provided
    const video = postData.video || postData.postVideo;
    if (video) {
      formData.append('postVideo', video);
    }
    
    const response = await api.post('/posts', formData);
    return response.data;
  },

  /**
   * Edit an existing post
   * @param {string} postId
   * @param {Object} data - { body: string }
   */
  editPost: async (postId, data) => {
    const response = await api.put(`/posts/${postId}`, data);
    return response.data;
  },

  /**
   * Delete a post (owner or admin)
   * @param {string} postId
   */
  deletePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}`);
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
   * @param {Object} params - { page, limit }
   */
  getPostComments: async (postId, params = {}) => {
    const response = await api.get(`/posts/${postId}/comments`, { params });
    return response.data;
  },

  /**
   * Save or unsave a feed post
   * @param {string} postId
   */
  toggleSavePost: async (postId) => {
    const response = await api.post(`/posts/${postId}/save`);
    return response.data;
  },
};

export default postService;
