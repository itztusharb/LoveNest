
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
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            setUser(profile);
          } else {
             console.error("Profile not found for authenticated user, signing out.");
             await firebaseSignOut(auth);
          }
        } catch (error) {
          console.error("Failed to fetch user profile, signing out.", error);
          await firebaseSignOut(auth);
        } finally {
            setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';

    if (!user && !isAuthPage) {
      router.replace('/sign-in');
    }
    if (user && isAuthPage) {
      router.replace('/dashboard');
    }

  }, [user, loading, pathname, router]);

  const signOut = async () => {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    await firebaseSignOut(auth);
    router.replace('/sign-in');
  };

  if (loading) {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="w-full max-w-md space-y-4 p-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    );
  }
  
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

