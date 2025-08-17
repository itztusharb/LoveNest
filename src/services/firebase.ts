import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import type { UserProfile } from '@/ai/flows/user-profile-flow';
import type { JournalEntry } from '@/ai/schemas/journal-schema';
import type { Photo, AddPhotoInput } from '@/ai/schemas/gallery-schema';
import 'dotenv/config';


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let firebaseApp: FirebaseApp;

export function getFirebaseApp(): FirebaseApp {
    if (getApps().length === 0) {
        if (!firebaseConfig.apiKey) {
            throw new Error('Missing Firebase API key');
        }
        firebaseApp = initializeApp(firebaseConfig);
    } else {
        firebaseApp = getApp();
    }
    return firebaseApp;
}

export async function createUserWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  const app = getFirebaseApp();
  const auth = getAuth(app);
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch(error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  const app = getFirebaseApp();
  const auth = getAuth(app);
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch(error) {
    console.error("Error signing in:", error);
    throw error;
  }
}

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
    try {
        const app = getFirebaseApp();
        const db = getFirestore(app);
        const userProfileRef = doc(db, 'userProfiles', userId);
        const userProfileSnap = await getDoc(userProfileRef);

        if (userProfileSnap.exists()) {
            return userProfileSnap.data() as UserProfile;
        } else {
            console.log(`No profile found for user ${userId}, returning null.`);
            return null;
        }
    } catch(error) {
        console.error('Could not fetch user profile.', error);
        // In case of error, we don't want to return mock data, but let the caller handle it.
        throw error;
    }
}

export async function updateUserProfile(profile: UserProfile): Promise<void> {
    const app = getFirebaseApp();
    const db = getFirestore(app);
    const userProfileRef = doc(db, 'userProfiles', profile.id);
    await setDoc(userProfileRef, profile, { merge: true });
}

export async function addJournalEntry(entry: Omit<JournalEntry, 'id'>): Promise<void> {
    const app = getFirebaseApp();
    const db = getFirestore(app);
    await addDoc(collection(db, 'journalEntries'), entry);
}

export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
    const app = getFirebaseApp();
    const db = getFirestore(app);
    const q = query(collection(db, 'journalEntries'), where('userId', '==', userId), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const entries: JournalEntry[] = [];
    querySnapshot.forEach((doc) => {
        entries.push({ id: doc.id, ...doc.data() } as JournalEntry);
    });
    return entries;
}

export async function addPhoto(photo: AddPhotoInput): Promise<void> {
    const app = getFirebaseApp();
    const db = getFirestore(app);
    await addDoc(collection(db, 'photos'), {
        ...photo,
        createdAt: new Date().toISOString(),
    });
}

export async function getPhotos(userId: string): Promise<Photo[]> {
    const app = getFirebaseApp();
    const db = getFirestore(app);
    const q = query(collection(db, 'photos'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const photos: Photo[] = [];
    querySnapshot.forEach((doc) => {
        photos.push({ id: doc.id, ...doc.data() } as Photo);
    });
    return photos;
}
