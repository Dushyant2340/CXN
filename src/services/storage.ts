import { ChatSession } from '../services/gemini';

const STORAGE_KEY = 'cxn_ai_sessions';

export const storage = {
  getSessions: (): ChatSession[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Storage load failed, clearing corrupted data:", error);
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  },

  saveSession: (session: ChatSession) => {
    const sessions = storage.getSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.unshift(session);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  },

  getSession: (id: string): ChatSession | undefined => {
    return storage.getSessions().find(s => s.id === id);
  },

  deleteSession: (id: string) => {
    const sessions = storage.getSessions().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }
};
