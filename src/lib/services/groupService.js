import api from '../api/axios';

const groupService = {
  /**
   * Fetch all groups.
   * Includes `isMember` boolean to indicate if the current user is a member.
   */
  getGroups: async () => {
    const response = await api.get('/network/groups');
    return response.data;
  },
  getGroupById: async (groupId) => {
    // /api/network/groups/:groupId
    const response = await api.get(`/network/groups/${groupId}`);
    return response.data;
  },

  createGroup: async (groupData) => {
    // groupData: { name, description, thumbnailUrl? }
    // privacyMode is always "PUBLIC" per your spec
    const response = await api.post('/network/groups', {
      ...groupData,
      privacyMode: 'PUBLIC', // Force public per backend spec
    });
    return response.data;
  },


  /**
   * Toggle membership for a group (action: "JOIN" or "LEAVE")
   * @param {string} groupId 
   * @param {string} action 
   * @param {string} userId 
   */
  toggleMembership: async (groupId, action, userId) => {
    const response = await api.post(`/network/groups/${groupId}/member`, {
      action, userId
    });
    return response.data;
  },
  getGroupMembers: async (groupId, page = 1, limit = 20) => {
    const response = await api.get(`/network/groups/${groupId}/members`, {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Create a new group
   * @param {FormData} formData - including name, description, and thumbnail
   */
  // createGroup: async (formData) => {
  //   const response = await api.post('/groups', formData, {
  //     headers: {
  //       'Content-Type': 'multipart/form-data',
  //     },
  //   });
  //   return response.data;
  // },

  /**
   * Manage a group member (action: "ADD" or "REMOVE")
   * @param {string} groupId 
   * @param {string} userId
   * @param {string} action 
   */
  manageMembers: async (groupId, userId, action) => {
    const response = await api.post(`/groups/${groupId}/manage-members`, {
      userId,
      action,
    });
    return response.data;
  },

  /**
   * Get member status for a specific group
   * @param {string} groupId 
   */
  getMemberStatus: async (groupId) => {
    const response = await api.get(`/groups/${groupId}/member`);
    return response.data;
  },
};

export default groupService;
