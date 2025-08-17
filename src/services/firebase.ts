
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

// Initialize Firebase for the client
let firebaseApp: FirebaseApp;
if (typeof window !== 'undefined' && !getApps().length) {
  if (isFirebaseConfigValid(firebaseConfig)) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    console.error("Client-side Firebase config is not valid. Please check your .env file.");
  }
} else if (getApps().length) {
    firebaseApp = getApp();
}


// A helper function to ensure Firebase is initialized for server-side operations
async function ensureFirebaseInitialized() {
  if (!getApps().length) {
    if (isFirebaseConfigValid(firebaseConfig)) {
      initializeApp(firebaseConfig);
    } else {
      throw new Error("Server-side Firebase config is not valid. Please check your environment variables.");
    }
  }
  return getApp();
}


// A helper function to create a user with email and password
export async function createUserWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  const app = await ensureFirebaseInitialized();
  const auth = getAuth(app);
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch(error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// A helper function to get a user's profile.
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
    if (!isFirebaseConfigValid(firebaseConfig)) {
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
  const app = await ensureFirebaseInitialized();
  const db = getFirestore(app);
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
    if (!isFirebaseConfigValid(firebaseConfig)) {
        throw new Error("Firestore is not configured. Cannot update profile.");
    }
    const app = await ensureFirebaseInitialized();
    const db = getFirestore(app);
    const userProfileRef = doc(db, 'userProfiles', profile.id);
    await setDoc(userProfileRef, profile, { merge: true });
}

export { firebaseApp };
