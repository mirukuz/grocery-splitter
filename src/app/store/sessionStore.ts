import { create } from 'zustand';
import { Session } from '../types';
import { sessionService } from '../services/api';

interface SessionState {
  sessions: Session[];
  currentSession: Session | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchSessions: () => Promise<void>;
  fetchSession: (id: string) => Promise<void>;
  createSession: (title: string, participantIds?: string[]) => Promise<Session>;
  updateSession: (id: string, data: { title?: string; participantIds?: string[] }) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  setCurrentSession: (session: Session | null) => void;
  setError: (error: string | null) => void;
}

const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,
  
  fetchSessions: async () => {
    try {
      set({ isLoading: true, error: null });
      const sessions = await sessionService.getSessions();
      set({ sessions, isLoading: false });
    } catch (error) {
      console.error('Error fetching sessions:', error);
      set({ error: 'Failed to fetch sessions', isLoading: false });
    }
  },
  
  fetchSession: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const session = await sessionService.getSession(id);
      set({ currentSession: session, isLoading: false });
    } catch (error) {
      console.error('Error fetching session:', error);
      set({ error: 'Failed to fetch session', isLoading: false });
    }
  },
  
  createSession: async (title, participantIds) => {
    try {
      set({ isLoading: true, error: null });
      const newSession = await sessionService.createSession({ title, participantIds });
      set((state) => ({
        sessions: [...state.sessions, newSession],
        isLoading: false
      }));
      return newSession;
    } catch (error) {
      console.error('Error creating session:', error);
      set({ error: 'Failed to create session', isLoading: false });
      throw error;
    }
  },
  
  updateSession: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const updatedSession = await sessionService.updateSession(id, data);
      
      set((state) => ({
        sessions: state.sessions.map(session => 
          session.id === id ? updatedSession : session
        ),
        currentSession: state.currentSession?.id === id ? updatedSession : state.currentSession,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating session:', error);
      set({ error: 'Failed to update session', isLoading: false });
    }
  },
  
  deleteSession: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await sessionService.deleteSession(id);
      
      set((state) => ({
        sessions: state.sessions.filter(session => session.id !== id),
        currentSession: state.currentSession?.id === id ? null : state.currentSession,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting session:', error);
      set({ error: 'Failed to delete session', isLoading: false });
    }
  },
  
  setCurrentSession: (session) => set({ currentSession: session }),
  
  setError: (error) => set({ error })
}));

export default useSessionStore;
