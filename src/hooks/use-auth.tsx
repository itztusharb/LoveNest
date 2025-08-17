
import { useContext } from 'react';
import { AuthContext } from '@/app/layout';

// Custom hook to use the AuthContext
export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
