
"use client";

import { AppShell } from '@/components/app-shell';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirebaseApp, getUserProfile } from '@/services/firebase';
import type { UserProfile } from '@/ai/flows/user-profile-flow';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

// 1. Define the Context
interface AuthContextType {
  user: UserProfile; // User is guaranteed to be non-null in protected routes
  signOut: () => Promise<void>;
  setUser: (user: UserProfile) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the AuthContext
export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}

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
             if (pathname !== '/dashboard') {
              router.push('/dashboard');
            }
          } else {
            // Profile doesn't exist, force sign out
            await firebaseSignOut(auth);
            setUser(null);
            router.push('/');
          }
        } catch (error) {
          console.error("Failed to fetch user profile, signing out.", error);
          await firebaseSignOut(auth);
          setUser(null);
          router.push('/');
        }
      } else {
        setUser(null);
        // Not logged in, redirect to sign-in page
        router.push('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const signOut = async () => {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    await firebaseSignOut(auth);
    setUser(null);
    router.push('/');
  };

  // While loading, show a full-page skeleton
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
  
  // After loading, if there's no user, redirect (though useEffect handles this)
  // This prevents children from rendering with null user
  if (!user) {
    return null; 
  }

  const value = {
    user,
    signOut,
    setUser: (updatedUser: UserProfile) => setUser(updatedUser),
  };
  
  // If user is loaded and exists, provide context and render children
  return (
    <AuthContext.Provider value={value}>
        <AppShell>{children}</AppShell>
    </AuthContext.Provider>
  );
}


// 3. Update AppLayout to use the new Provider
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <AuthProvider>
          {children}
      </AuthProvider>
  );
}
