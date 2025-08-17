import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { galleryPhotos } from '@/lib/data';

export default function GalleryPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Photo Gallery</h1>
          <p className="text-muted-foreground">
            A collection of your cherished moments.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Upload Photo
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {galleryPhotos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden">
            <CardContent className="p-0">
              <Image
                src={photo.src}
                alt={photo.alt}
                width={600}
                height={400}
                className="aspect-[3/2] h-auto w-full object-cover transition-transform duration-300 hover:scale-105"
                data-ai-hint={photo.hint}
              />
            </CardContent>
            <CardFooter className="p-4">
              <p className="text-sm text-muted-foreground">{photo.caption}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
