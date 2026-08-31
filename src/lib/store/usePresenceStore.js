import { create } from 'zustand';

const usePresenceStore = create((set, get) => ({
  presenceMap: {},
  setPresence: (userId, status) =>
    set((state) => ({
      presenceMap: { ...state.presenceMap, [userId]: status },
    })),
  getStatus: (userId) => get().presenceMap[userId] || 'offline',
  isOnline: (userId) => get().presenceMap[userId] === 'online',
}));

export default usePresenceStore;
