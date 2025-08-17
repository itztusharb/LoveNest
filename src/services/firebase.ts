
import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
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

export async function createUserProfile(profileData) {
    const profile = {
        anniversary: null,
        partnerId: null,
        ...profileData
    };
    await updateUserProfile(profile);
    return profile;
}

export async function signInWithGoogle() {
  const app = getFirebaseApp();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user profile already exists
    const profile = await getUserProfile(user.uid);
    
    if (!profile) {
      // If profile doesn't exist, create it
      await createUserProfile({
        id: user.uid,
        name: user.displayName,
        email: user.email,
        photoUrl: user.photoURL,
      });
    }
    
    return result;

  } catch(error) {
    console.error("Error during Google sign-in:", error);
    throw error;
  }
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
            // This is not an error, it's a valid state for a new user.
            console.log(`No profile found for user ${userId}, returning null.`);
            return null;
        }
    } catch(error) {
        console.error('Could not fetch user profile.', error);
        throw error;
    }
}

export async function findUserByEmail(email) {
    const app = getFirebaseApp();
    const db = getFirestore(app);
    const q = query(collection(db, 'userProfiles'), where('email', '==', email), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data();
    }
    return null;
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
    const q = query(collection(db, 'journalEntries'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const entries = [];
    querySnapshot.forEach((doc) => {
        entries.push({ id: doc.id, ...doc.data() });
    });
    // Sort manually to avoid composite index requirement
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
    const q = query(collection(db, 'photos'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const photos = [];
    querySnapshot.forEach((doc) => {
        photos.push({ id: doc.id, ...doc.data() });
    });
    // Sort manually to avoid composite index requirement
    return photos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
