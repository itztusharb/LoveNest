"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirebaseApp } from '@/services/firebase';
import { getUserProfile } from '@/services/firebase';
import type { UserProfile } from '@/ai/flows/user-profile-flow';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    setUser: (user: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
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
                        const isAuthPage = pathname === '/' || pathname === '/sign-in';
                        if (isAuthPage) {
                             router.push('/dashboard');
                        }
                    } else {
                       // This case can happen if the user is created in auth but the profile document isn't.
                       // For now, we treat it as logged out.
                       setUser(null); 
                    }
                } catch (error) {
                    console.error("Failed to fetch user profile, signing out.", error);
                    await firebaseSignOut(auth);
                    setUser(null);
                } finally {
                    setLoading(false);
                }
            } else {
                setUser(null);
                setLoading(false);
            }
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

    const value = {
        user,
        loading,
        signOut,
        setUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
