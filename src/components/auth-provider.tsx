
"use client";

import { useState, useEffect, createContext } from 'react';
import { getAuth, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirebaseApp, getUserProfile, createUserProfile, updateUserLastSeen } from '@/services/firebase';
import { useRouter } from 'next/navigation';

export const AuthContext = createContext<{
    user: any;
    signOut: () => void;
    setUser: (user: any) => void;
    loading: boolean;
} | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          let profile = await getUserProfile(firebaseUser.uid);
          
          if (!profile) {
            console.log("Profile not found for authenticated user, creating one.");
            profile = await createUserProfile({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'New User',
              email: firebaseUser.email,
              photoUrl: firebaseUser.photoURL || `https://placehold.co/80x80.png?text=${firebaseUser.email?.charAt(0).toUpperCase() || 'U'}`,
              anniversary: null,
            });
          } else {
             await updateUserLastSeen(firebaseUser.uid);
          }
          setUser(profile);

        } catch (error) {
          console.error("Failed to fetch or create user profile, signing out.", error);
          await firebaseSignOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const signOut = async () => {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    await firebaseSignOut(auth);
    setUser(null);
    router.replace('/sign-in');
  };

  const value = {
    user,
    signOut,
    setUser,
    loading,
  };
  
  return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
  );
}
