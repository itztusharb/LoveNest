"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Camera, BookText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import { differenceInDays, parseISO, format } from 'date-fns';

export default function Dashboard() {
  const { user, loading } = useAuth();

  const anniversaryInfo = useMemo(() => {
    if (!user?.anniversary) return null;
    try {
      const anniversaryDate = parseISO(user.anniversary);
      const today = new Date();
      let nextAnniversary = new Date(today.getFullYear(), anniversaryDate.getMonth(), anniversaryDate.getDate());
      if (nextAnniversary < today) {
        nextAnniversary.setFullYear(today.getFullYear() + 1);
      }
      const daysAway = differenceInDays(nextAnniversary, today);
      const formattedDate = format(nextAnniversary, "MMMM d");
      return { daysAway, formattedDate };
    } catch(e) {
      // Handles invalid date format in DB
      return null;
    }
  }, [user?.anniversary]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name || 'Lovebirds'}!</h1>
        <p className="text-muted-foreground">
          Here's a glimpse into your shared world.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Upcoming Anniversary</span>
            </CardTitle>
            <CardDescription>
              Your most important date is just around the corner!
            </CardDescription>
          </CardHeader>
          <CardContent>
            {anniversaryInfo ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted p-8 text-center">
                <p className="text-4xl font-bold text-primary">{anniversaryInfo.formattedDate}</p>
                <p className="text-muted-foreground">{anniversaryInfo.daysAway} days away</p>
              </div>
            ) : (
                 <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted p-8 text-center">
                    <p className="text-muted-foreground">Set your anniversary date in your profile!</p>
                </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookText className="h-5 w-5 text-primary" />
              <span>Latest Journal Entry</span>
            </CardTitle>
            <CardDescription>A snippet from your last shared thought.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="font-semibold">"A walk to remember"</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">
                Today was one of those simple, perfect days. The weather was beautiful, and we decided to revisit the park where we had our third date. It's funny how some things change, yet the most important things...
              </p>
              <Button variant="outline" asChild>
                <Link href="/journal">Read More</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              <span>Recent Photos</span>
            </CardTitle>
            <CardDescription>Relive your recent moments together.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <Image
                src="https://placehold.co/100x100.png"
                alt="Recent photo 1"
                width={100}
                height={100}
                className="rounded-md object-cover"
                data-ai-hint="couple beach"
              />
              <Image
                src="https://placehold.co/100x100.png"
                alt="Recent photo 2"
                width={100}
                height={100}
                className="rounded-md object-cover"
                data-ai-hint="couple cooking"
              />
              <Image
                src="https://placehold.co/100x100.png"
                alt="Recent photo 3"
                width={100}
                height={100}
                className="rounded-md object-cover"
                data-ai-hint="couple hiking"
              />
            </div>
             <Button variant="outline" asChild className="mt-4 w-full">
                <Link href="/gallery">View Gallery</Link>
              </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-4 w-1/3 mt-2" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
             <Skeleton className="h-6 w-3/4" />
             <Skeleton className="h-4 w-1/2 mt-1" />
          </CardHeader>
          <CardContent>
             <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
             <Skeleton className="h-6 w-3/4" />
             <Skeleton className="h-4 w-1/2 mt-1" />
          </CardHeader>
          <CardContent className="space-y-3">
             <Skeleton className="h-5 w-1/3" />
             <Skeleton className="h-12 w-full" />
             <Skeleton className="h-9 w-24" />
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-1" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-[100px] w-[100px] rounded-md" />
                <Skeleton className="h-[100px] w-[100px] rounded-md" />
                <Skeleton className="h-[100px] w-[100px] rounded-md" />
            </div>
            <Skeleton className="h-9 w-full mt-4" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
