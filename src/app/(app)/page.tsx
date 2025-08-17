"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Camera, BookText, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AppRootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-full min-h-[400px] w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // This part will be replaced by the redirect, but it's here as a fallback.
  return (
    <div className="flex h-full min-h-[400px] w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}
