
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Heart } from 'lucide-react';
import { signInWithGoogle } from '@/services/firebase';
import { useRouter } from 'next/navigation';

function GoogleIcon(props) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="24px"
        height="24px"
        {...props}
      >
        <path
          fill="#FFC107"
          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        />
        <path
          fill="#FF3D00"
          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
        />
        <path
          fill="#1976D2"
          d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.999,35.596,44,30.166,44,24C44,22.659,43.862,21.35,43.611,20.083z"
        />
      </svg>
    );
  }

export default function SignInPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleGoogleSignIn() {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: 'Signed In!',
        description: 'Welcome to LoveNest!',
      });
      router.replace('/');
    } catch (error) {
      console.error("Google Sign-In Error", error);
      if (error.code === 'auth/popup-closed-by-user') {
         toast({
            variant: 'destructive',
            title: 'Sign-in Cancelled',
            description: 'You closed the sign-in window. Please try again.',
        });
      } else {
        toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description:
            error.message || 'There was a problem with your Google Sign-In request.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-8 px-4 py-12 sm:px-6 lg:px-8">
            <div>
                <Heart className="mx-auto h-12 w-auto text-primary" />
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
                Sign in to your LoveNest
                </h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    A shared space for you and your partner.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Welcome</CardTitle>
                    <CardDescription>
                        Sign in with your Google account to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        type="button"
                        className="w-full"
                        disabled={isLoading}
                        onClick={handleGoogleSignIn}
                        variant="outline"
                    >
                        {isLoading ? (
                            'Signing In...'
                        ) : (
                            <>
                                <GoogleIcon className="mr-2" />
                                Sign in with Google
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
