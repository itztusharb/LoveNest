
import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import 'dotenv/config';


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let firebaseApp;

export function getFirebaseApp() {
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
  email,
  password
) {
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
  email,
  password
) {
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
  userId
) {
    try {
        const app = getFirebaseApp();
        const db = getFirestore(app);
        const userProfileRef = doc(db, 'userProfiles', userId);
        const userProfileSnap = await getDoc(userProfileRef);

        if (userProfileSnap.exists()) {
            return userProfileSnap.data();
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

export async function updateUserProfile(profile) {
    const app = getFirebaseApp();
    const db = getFirestore(app);
    const userProfileRef = doc(db, 'userProfiles', profile.id);
    await setDoc(userProfileRef, profile, { merge: true });
}

export async function addJournalEntry(entry) {
    const app = getFirebaseApp();
    const db = getFirestore(app);
    await addDoc(collection(db, 'journalEntries'), entry);
}

export async function getJournalEntries(userId) {
    const app = getFirebaseApp();
    const db = getFirestore(app);
    const q = query(collection(db, 'journalEntries'), where('userId', '==', userId), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const entries = [];
    querySnapshot.forEach((doc) => {
        entries.push({ id: doc.id, ...doc.data() });
    });
    return entries;
}

export async function addPhoto(photo) {
    const app = getFirebaseApp();
    const db = getFirestore(app);
    await addDoc(collection(db, 'photos'), {
        ...photo,
        createdAt: new Date().toISOString(),
    });
}

export async function getPhotos(userId) {
    const app = getFirebaseApp();
    const db = getFirestore(app);
    const q = query(collection(db, 'photos'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const photos = [];
    querySnapshot.forEach((doc) => {
        photos.push({ id: doc.id, ...doc.data() });
    });
    return photos;
}
