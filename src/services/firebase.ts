
import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, query, where, writeBatch, updateDoc, deleteField, FieldValue, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
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
    const q = query(collection(db, 'userProfiles'), where('email', '==', email));
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

export async function getJournalEntries(userIds: string[]) {
    if (!userIds || userIds.length === 0) {
        return [];
    }
    const app = getFirebaseApp();
    const db = getFirestore(app);
    const q = query(collection(db, 'journalEntries'), where('userId', 'in', userIds));
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
    const dbPhoto = {
        ...photo,
        createdAt: new Date().toISOString(),
    };
    if (!dbPhoto.partnerId) {
        delete dbPhoto.partnerId;
    }

    await addDoc(collection(db, 'photos'), dbPhoto);
}

export async function getPhotos(userIds: string[]) {
    if (!userIds || userIds.length === 0) {
        return [];
    }
    const app = getFirebaseApp();
    const db = getFirestore(app);
    
    const photosQuery = query(collection(db, 'photos'), where('userId', 'in', userIds));
    
    const querySnapshot = await getDocs(photosQuery);
    const photos = [];
    querySnapshot.forEach((doc) => {
        photos.push({ id: doc.id, ...doc.data() });
    });
    return photos;
}

// Notification and Linking services
export async function createLinkRequest(request: { fromUserId: string, fromUserName: string, fromUserEmail: string, toUserId: string }) {
    const app = getFirebaseApp();
    const db = getFirestore(app);
    const batch = writeBatch(db);

    // Create the link request
    const linkRequestRef = doc(collection(db, 'linkRequests'));
    const linkRequest = {
        ...request,
        id: linkRequestRef.id,
        status: 'pending',
        createdAt: new Date().toISOString(),
    };
    batch.set(linkRequestRef, linkRequest);

    // Create a notification for the recipient
    const notificationRef = doc(collection(db, 'notifications'));
    const notification = {
        id: notificationRef.id,
        userId: request.toUserId,
        type: 'link_request',
        data: { fromUserName: request.fromUserName, fromUserEmail: request.fromUserEmail },
        isRead: false,
        createdAt: new Date().toISOString(),
        linkRequestId: linkRequestRef.id,
    };
    batch.set(notificationRef, notification);

    await batch.commit();
}

export async function getNotifications(userId) {
    const app = getFirebaseApp();
    const db = getFirestore(app);
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const notifications = [];
    querySnapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() });
    });
    // Sort manually to avoid composite index requirement
    return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function respondToLinkRequest({ linkRequestId, notificationId, response }) {
    const app = getFirebaseApp();
    const db = getFirestore(app);
    const batch = writeBatch(db);

    const linkRequestRef = doc(db, 'linkRequests', linkRequestId);
    const notificationRef = doc(db, 'notifications', notificationId);

    // Get the link request to find the user IDs
    const linkRequestSnap = await getDoc(linkRequestRef);
    if (!linkRequestSnap.exists()) {
        throw new Error('Link request not found.');
    }
    const linkRequest = linkRequestSnap.data();

    if (response === 'accepted') {
        // Update link request status
        batch.update(linkRequestRef, { status: 'accepted' });

        // Link users
        const user1Ref = doc(db, 'userProfiles', linkRequest.fromUserId);
        const user2Ref = doc(db, 'userProfiles', linkRequest.toUserId);
        batch.update(user1Ref, { partnerId: linkRequest.toUserId });
        batch.update(user2Ref, { partnerId: linkRequest.fromUserId });
    } else {
        // Update link request status to declined
        batch.update(linkRequestRef, { status: 'declined' });
    }

    // Delete the notification
    batch.delete(notificationRef);
    
    await batch.commit();
}


export async function markNotificationAsRead(notificationId: string) {
    const app = getFirebaseApp();
    const db = getFirestore(app);
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, { isRead: true });
}

export async function unlinkPartner(userId: string, partnerId: string) {
    const app = getFirebaseApp();
    const db = getFirestore(app);
    const batch = writeBatch(db);
    
    const userRef = doc(db, 'userProfiles', userId);
    const partnerRef = doc(db, 'userProfiles', partnerId);

    // Use Firestore's FieldValue.delete() to remove the field
    batch.update(userRef, { partnerId: deleteField() });
    batch.update(partnerRef, { partnerId: deleteField() });
    
    await batch.commit();
}

// Chat services
export async function getOrCreateChatId(userId1: string, userId2: string): Promise<string> {
    const app = getFirebaseApp();
    const db = getFirestore(app);
    // Sort user IDs to create a consistent chat ID
    const chatId = [userId1, userId2].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
        await setDoc(chatRef, {
            participants: [userId1, userId2],
            createdAt: serverTimestamp(),
        });
    }

    return chatId;
}

export async function addChatMessage(chatId: string, message: { senderId: string, text: string }) {
    const app = getFirebaseApp();
    const db = getFirestore(app);
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
        ...message,
        createdAt: new Date().toISOString(),
    });
}

export function getChatMessages(chatId: string, callback: (messages: any[]) => void) {
    const app = getFirebaseApp();
    const db = getFirestore(app);
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages = [];
        querySnapshot.forEach((doc) => {
            messages.push({ id: doc.id, ...doc.data() });
        });
        callback(messages);
    });

    return unsubscribe;
}
