import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { ChatSession } from '../services/gemini';

const SESSIONS_COLLECTION = 'sessions';

export const dbService = {
  async saveSession(userId: string, session: ChatSession) {
    const sessionRef = doc(db, SESSIONS_COLLECTION, session.id);
    await setDoc(sessionRef, {
      ...session,
      userId,
      updatedAt: serverTimestamp()
    });
  },

  async getSessions(userId: string): Promise<ChatSession[]> {
    const q = query(
      collection(db, SESSIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.id,
        title: data.title,
        messages: data.messages,
        createdAt: data.createdAt
      } as ChatSession;
    });
  },

  async deleteSession(sessionId: string) {
    await deleteDoc(doc(db, SESSIONS_COLLECTION, sessionId));
  },

  async updateSessionMessages(sessionId: string, messages: any[]) {
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    await updateDoc(sessionRef, {
      messages,
      updatedAt: serverTimestamp()
    });
  }
};
