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

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, Lovebirds!</h1>
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
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted p-8 text-center">
              <p className="text-4xl font-bold text-primary">July 25</p>
              <p className="text-muted-foreground">24 days away</p>
            </div>
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
