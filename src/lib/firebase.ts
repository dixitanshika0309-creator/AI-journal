import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Firestore,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { JournalEntry } from '../types';

const env = typeof import.meta !== 'undefined' ? (import.meta as any).env || {} : {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || firebaseConfigData?.apiKey || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigData?.authDomain || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || firebaseConfigData?.projectId || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigData?.storageBucket || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigData?.messagingSenderId || '',
  appId: env.VITE_FIREBASE_APP_ID || firebaseConfigData?.appId || '',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigData?.measurementId || '',
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Firestore (with support for custom databaseId)
const firestoreDbId = env.VITE_FIREBASE_DATABASE_ID || firebaseConfigData?.firestoreDatabaseId;
export const db: Firestore = firestoreDbId && firestoreDbId !== '(default)'
  ? getFirestore(app, firestoreDbId)
  : getFirestore(app);

// Authentication Functions
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export function subscribeToAuth(callback: (user: FirebaseUser | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

/**
 * Strict Undefined-Stripping Utility to guarantee zero-crash Firestore writes
 */
export function sanitizePayload<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_, value) => (value === undefined ? null : value))
  );
}

/**
 * Save / Update a Journal Entry in the user's isolated subcollection:
 * /users/{userId}/entries/{entryId}
 */
export async function saveJournalEntry(userId: string, entry: JournalEntry): Promise<void> {
  if (!userId) throw new Error('User ID is required to save entry');
  if (!entry.id) throw new Error('Entry ID is required');

  const entryRef = doc(db, 'users', userId, 'entries', entry.id);
  const cleanData = sanitizePayload({
    ...entry,
    userId,
    updatedAt: Date.now(),
  });

  await setDoc(entryRef, cleanData, { merge: true });
}

/**
 * Delete a Journal Entry from the user's isolated subcollection
 */
export async function deleteJournalEntry(userId: string, entryId: string): Promise<void> {
  if (!userId || !entryId) throw new Error('User ID and Entry ID required');
  const entryRef = doc(db, 'users', userId, 'entries', entryId);
  await deleteDoc(entryRef);
}

/**
 * Real-time subscription to user's journal entries
 */
export function subscribeToUserEntries(
  userId: string,
  onUpdate: (entries: JournalEntry[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const entriesRef = collection(db, 'users', userId, 'entries');
  const q = query(entriesRef, orderBy('updatedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const entries: JournalEntry[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as JournalEntry;
        entries.push({
          ...data,
          id: docSnap.id,
        });
      });
      onUpdate(entries);
    },
    (error) => {
      console.error('Firestore snapshot subscription error:', error);
      if (onError) onError(error);
    }
  );
}
