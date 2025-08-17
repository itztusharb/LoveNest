import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from '@/ai/flows/user-profile-flow';
import 'dotenv/config';


const clientFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const serverFirebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

function isFirebaseConfigValid(config: Record<string, string | undefined>): boolean {
  return Object.values(config).every((value) => !!value);
}

let firebaseApp: FirebaseApp;

function getFirebaseApp(): FirebaseApp {
    if (firebaseApp) {
        return firebaseApp;
    }

    if (getApps().length > 0) {
        firebaseApp = getApp();
        return firebaseApp;
    }

    const isServer = typeof window === 'undefined';
    const config = isServer ? serverFirebaseConfig : clientFirebaseConfig;

    if (isFirebaseConfigValid(config)) {
        firebaseApp = initializeApp(config);
        return firebaseApp;
    } else {
        const environment = isServer ? 'Server-side' : 'Client-side';
        const errorMessage = `${environment} Firebase config is not valid. Please check your environment variables.`;
        console.error(errorMessage, config);
        throw new Error(errorMessage);
    }
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
    } catch(error) {
        console.warn('Could not fetch user profile. This might be due to missing Firebase config. Serving mock data.', error);
        return {
            id: userId,
            name: 'User',
            email: 'user@email.com',
            photoUrl: 'https://placehold.co/80x80.png',
            anniversary: '2020-07-25',
        };
    }
}

export async function updateUserProfile(profile: UserProfile): Promise<void> {
    const app = getFirebaseApp();
    const db = getFirestore(app);
    const userProfileRef = doc(db, 'userProfiles', profile.id);
    await setDoc(userProfileRef, profile, { merge: true });
}
