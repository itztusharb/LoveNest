
"use client";

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { useState, useEffect, createContext } from 'react';
import { getAuth, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirebaseApp, getUserProfile, createUserProfile } from '@/services/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';

export const AuthContext = createContext<{
    user: any;
    signOut: () => void;
    setUser: (user: any) => void;
    loading: boolean;
} | undefined>(undefined);

function AuthProvider({ children }: { children: React.ReactNode }) {
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
            // This can happen if the user exists in Auth but not in Firestore,
            // for example if they are a new user. We create the profile here.
            profile = await createUserProfile({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'New User',
              email: firebaseUser.email,
              photoUrl: firebaseUser.photoURL || `https://placehold.co/80x80.png?text=${firebaseUser.email?.charAt(0).toUpperCase() || 'U'}`,
              anniversary: null,
              partnerId: null,
            });
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
  }, []);

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

function ConditionalLayout({ children }: { children: React.ReactNode}) {
    const pathname = usePathname();
    const noShellRoutes = ['/sign-in', '/'];

    if (noShellRoutes.includes(pathname)) {
        return <>{children}</>;
    }

    return <AppShell>{children}</AppShell>;
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
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
            <ConditionalLayout>
                {children}
            </ConditionalLayout>
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
