"use client";

import { useAuth } from '@/hooks/use-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, BookText, Camera, Gift } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInDays, format, parseISO } from 'date-fns';
import Image from 'next/image';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    // This can be a redirect or a message, but for now, we'll return null
    // as the AuthProvider should handle redirection for unauthenticated users.
    return <DashboardSkeleton />;
  }
  
  const getDaysToAnniversary = () => {
    if (!user.anniversary) return null;
    try {
      const anniversaryDate = parseISO(user.anniversary);
      const today = new Date();
      let nextAnniversary = new Date(today.getFullYear(), anniversaryDate.getMonth(), anniversaryDate.getDate());
      if (nextAnniversary < today) {
        nextAnniversary.setFullYear(today.getFullYear() + 1);
      }
      return differenceInDays(nextAnniversary, today);
    } catch (e) {
      console.error("Error parsing anniversary date", e);
      return null;
    }
  };

  const daysToAnniversary = getDaysToAnniversary();


  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, {user.name}!
        </h1>
        <p className="text-muted-foreground">
          Here's a snapshot of your shared world.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Gift className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Upcoming Anniversary</CardTitle>
                <CardDescription>Your special day is coming!</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
             {daysToAnniversary !== null ? (
                <div className="text-center">
                    <p className="text-6xl font-bold text-primary">{daysToAnniversary}</p>
                    <p className="text-muted-foreground">days to go</p>
                </div>
            ) : (
                <p className="text-muted-foreground">Set your anniversary date in your profile!</p>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-4">
              <BookText className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Latest Journal Entry</CardTitle>
                <CardDescription>Remember this moment?</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="space-y-2">
                <h3 className="font-semibold">A Day to Remember</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                    We went to that little cafe by the park... It was such a perfect afternoon, just watching the world go by and talking for hours. I love how we can...
                </p>
            </div>
          </CardContent>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
                <Link href="/journal">
                    View Journal <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Camera className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Recent Photos</CardTitle>
                <CardDescription>From your gallery.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
             <div className="grid grid-cols-3 gap-2">
                <ImagePlaceholder hint="couple smiling" />
                <ImagePlaceholder hint="romantic dinner" />
                <ImagePlaceholder hint="beach sunset" />
             </div>
          </CardContent>
           <CardContent>
            <Button asChild variant="outline" className="w-full">
                <Link href="/gallery">
                    View Gallery <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ImagePlaceholder({hint}: {hint: string}) {
    return <Image src="https://placehold.co/100x100.png" width={100} height={100} alt="placeholder" className="aspect-square w-full rounded-md object-cover" data-ai-hint={hint} />
}


function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="mt-2 h-4 w-1/3" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div>
                <Skeleton className="h-6 w-36" />
                <Skeleton className="mt-1 h-4 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <Skeleton className="h-16 w-24 mx-auto" />
             <Skeleton className="mt-2 h-4 w-16 mx-auto" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="mt-1 h-4 w-24" />
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
          <CardContent>
             <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
           <CardHeader>
            <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="mt-1 h-4 w-24" />
                </div>
            </div>
          </Header>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="aspect-square w-full" />
            </div>
          </CardContent>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
