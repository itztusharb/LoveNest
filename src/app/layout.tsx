
"use client";

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { useState, useEffect, createContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirebaseApp, getUserProfile } from '@/services/firebase';
import type { UserProfile } from '@/ai/flows/user-profile-flow';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';

// 1. Define the Context
interface AuthContextType {
  user: UserProfile | null;
  signOut: () => Promise<void>;
  setUser: (user: UserProfile) => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Create the AuthProvider Component
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const app = getFirebaseApp();
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            setUser(profile);
          } else {
             console.error("Profile not found for authenticated user, signing out.");
             await firebaseSignOut(auth);
             setUser(null);
          }
        } catch (error) {
          console.error("Failed to fetch user profile, signing out.", error);
          await firebaseSignOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const signOut = async () => {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    await firebaseSignOut(auth);
    router.replace('/sign-in');
  };

  const value = {
    user,
    signOut,
    setUser: (updatedUser: UserProfile) => setUser(updatedUser),
    loading,
  };
  
  return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,200..900;1,7..72,200..900&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
