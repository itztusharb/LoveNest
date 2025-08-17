import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from '@/ai/flows/user-profile-flow';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Function to check if the Firebase config is valid
function isFirebaseConfigValid(config: typeof firebaseConfig): boolean {
  return Object.values(config).every((value) => !!value);
}

// Initialize Firebase only if the config is valid
let app: FirebaseApp | null = null;
if (isFirebaseConfigValid(firebaseConfig)) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
}
export const firebaseApp = app;

const auth = firebaseApp ? getAuth(firebaseApp) : null;
const db = firebaseApp ? getFirestore(firebaseApp) : null;

// A helper function to create a user with email and password
export async function createUserWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized.');
  }
  return await createUserWithEmailAndPassword(auth, email, password);
}

// A helper function to get a user's profile.
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  if (!db) {
    console.warn('Firestore is not initialized. Serving mock data.');
    // Return a default profile if the database is not configured
    return {
      id: userId,
      name: 'User',
      email: 'user@email.com',
      photoUrl: 'https://placehold.co/80x80.png',
      anniversary: '2020-07-25',
    };
  }
  const userProfileRef = doc(db, 'userProfiles', userId);
  const userProfileSnap = await getDoc(userProfileRef);

  if (userProfileSnap.exists()) {
    return userProfileSnap.data() as UserProfile;
  } else {
    // If the profile doesn't exist, create a sample one
    const newUserProfile: UserProfile = {
      id: userId,
      name: 'User',
      email: 'user@email.com',
      photoUrl: 'https://placehold.co/80x80.png',
      anniversary: '2020-07-25',
    };
    await setDoc(userProfileRef, newUserProfile);
    return newUserProfile;
  }
}

export async function updateUserProfile(profile: UserProfile): Promise<void> {
    if (!db) {
        throw new Error("Firestore is not configured. Cannot update profile.");
    }
    const userProfileRef = doc(db, 'userProfiles', profile.id);
    await setDoc(userProfileRef, profile, { merge: true });
}
