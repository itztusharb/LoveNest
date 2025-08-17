"use client";

import { useAuth } from '@/hooks/use-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, BookText, Camera, Gift } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInDays, parseISO } from 'date-fns';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getJournalEntries } from '@/ai/flows/journal-flow';
import { getPhotos } from '@/ai/flows/gallery-flow';
import type { JournalEntry } from '@/ai/schemas/journal-schema';
import type { Photo } from '@/ai/schemas/gallery-schema';


export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [latestEntry, setLatestEntry] = useState<JournalEntry | null>(null);
  const [recentPhotos, setRecentPhotos] = useState<Photo[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user && !loading) {
      const fetchData = async () => {
        try {
          setDataLoading(true);
          const entries = await getJournalEntries(user.id);
          if (entries.length > 0) {
            setLatestEntry(entries[0]);
          }

          const photos = await getPhotos(user.id);
          setRecentPhotos(photos.slice(0, 3));
        } catch (error) {
          console.error("Failed to fetch dashboard data", error);
        } finally {
          setDataLoading(false);
        }
      };
      fetchData();
    }
  }, [user, loading]);

  if (loading || !user) {
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
            {dataLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : latestEntry ? (
              <div className="space-y-2">
                  <h3 className="font-semibold">{latestEntry.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                      {latestEntry.excerpt}
                  </p>
              </div>
            ) : (
               <p className="text-sm text-muted-foreground">No journal entries yet. Write one!</p>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
                <Link href="/journal">
                    View Journal <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
          </CardFooter>
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
            {dataLoading ? (
               <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="aspect-square w-full" />
               </div>
            ) : recentPhotos.length > 0 ? (
               <div className="grid grid-cols-3 gap-2">
                  {recentPhotos.map(photo => (
                    <Image key={photo.id} src={photo.src} width={100} height={100} alt={photo.caption} className="aspect-square w-full rounded-md object-cover" data-ai-hint={photo.hint} />
                  ))}
               </div>
            ) : (
                <p className="text-sm text-muted-foreground">No photos yet. Add some!</p>
            )}
          </CardContent>
           <CardFooter>
            <Button asChild variant="outline" className="w-full">
                <Link href="/gallery">
                    View Gallery <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
          </CardFooter>
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
          <CardFooter>
             <Skeleton className="h-10 w-full" />
          </CardFooter>
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
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="aspect-square w-full" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
