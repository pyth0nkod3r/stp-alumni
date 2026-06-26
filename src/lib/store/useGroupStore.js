import { create } from 'zustand';

export const useGroupStore = create((set) => ({
  groups: null,
  isLoading: false,
  error: null,

  setGroups: (data) => set({ groups: data }),
  setLoading: (status) => set({ isLoading: status }),
  setError: (error) => set({ error }),
  
  // Optimistic UI toggle for membership changes
  toggleGroupMembershipLocally: (groupId, isMember) => 
    set((state) => ({
      groups: state.groups 
        ? state.groups.map(group => 
            group.groupId === groupId 
              ? { 
                  ...group, 
                  isMember, 
                  memberCount: isMember 
                    ? (parseInt(group.memberCount) || 0) + 1 
                    : Math.max(0, (parseInt(group.memberCount) || 0) - 1) 
                }
              : group
          )
        : null
    })),

  // 👇 NEW: Add newly created group to store
  addGroupLocally: (newGroup) =>
    set((state) => {
      // The backend might return the group object nested inside a 'group' property or directly
      const groupData = newGroup?.group ? newGroup.group : newGroup;
      
      const mappedGroup = {
        groupId: groupData?.groupId || groupData?.id || groupData?._id,
        name: groupData?.name || groupData?.groupName || '',
        description: groupData?.description || '',
        thumbnailUrl: groupData?.thumbnailUrl || groupData?.thumbnail || groupData?.coverImagePath || null,
        isMember: true, // Creator is automatically a member
        myRole: 'ADMIN',
        memberCount: 1,
      };

      return {
        groups: state.groups 
          ? [...state.groups, mappedGroup] 
          : [mappedGroup],
      };
    }),
}));