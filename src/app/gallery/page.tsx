
"use client";

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, UploadCloud, X, Camera } from 'lucide-react';
import { useAuthContext } from '@/hooks/use-auth';
import { useEffect, useState, useRef } from 'react';
import { getPhotos, addPhoto } from '@/ai/flows/gallery-flow';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function GalleryPage() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [caption, setCaption] = useState('');
  const [hint, setHint] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const fetchPhotos = async () => {
    if (user) {
      try {
        setLoading(true);
        const userPhotos = await getPhotos(user.id);
        setPhotos(userPhotos);
      } catch (error) {
        console.error("Failed to fetch photos", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load your photos.',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [user]);

  const resetForm = () => {
    setCaption('');
    setHint('');
    setFile(null);
    setPreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !caption || !hint || !user) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please provide a file, caption, and hint.',
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64String = reader.result;
        
        await addPhoto({
          userId: user.id,
          src: base64String,
          caption,
          hint,
        });

        toast({
          title: 'Success!',
          description: 'Your photo has been uploaded.',
        });
        
        await fetchPhotos(); // Refresh gallery
        setIsDialogOpen(false); // Close dialog
        resetForm();
      };
    } catch (error) {
      console.error("Upload failed", error);
      toast({
        variant: 'destructive',
        title: 'Upload Error',
        description: 'Failed to upload your photo.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Photo Gallery</h1>
          <p className="text-muted-foreground">
            A collection of your cherished moments.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Upload Photo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload a new photo</DialogTitle>
              <DialogDescription>
                Share a new memory with your partner.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload}>
              <div className="grid gap-4 py-4">
                 <div className="space-y-2">
                  <Label>Photo</Label>
                   {preview ? (
                     <div className="relative">
                       <Image src={preview} alt="Image preview" width={400} height={250} className="w-full h-auto rounded-md" />
                       <Button type="button" size="icon" variant="destructive" className="absolute top-2 right-2 h-6 w-6" onClick={() => {
                         setPreview(null);
                         setFile(null);
                         if (fileInputRef.current) fileInputRef.current.value = '';
                       }}>
                         <X className="h-4 w-4" />
                       </Button>
                     </div>
                   ) : (
                    <div className="flex items-center justify-center w-full">
                      <Label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                              <p className="text-xs text-muted-foreground">PNG, JPG or GIF</p>
                          </div>
                          <Input id="photo-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" ref={fileInputRef}/>
                      </Label>
                    </div> 
                  )}
                 </div>
                <div className="space-y-2">
                  <Label htmlFor="caption">Caption</Label>
                  <Textarea id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="A lovely day at the beach." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hint">AI Hint</Label>
                  <Input id="hint" value={hint} onChange={(e) => setHint(e.target.value)} placeholder="e.g. 'beach sunset'" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="aspect-[3/2] w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            ))}
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <CardContent className="p-0">
                <Image
                  src={photo.src}
                  alt={photo.caption}
                  width={600}
                  height={400}
                  className="aspect-[3/2] h-auto w-full object-cover transition-transform duration-300 hover:scale-105"
                  data-ai-hint={photo.hint}
                  unoptimized // Required for base64 images
                />
              </CardContent>
              <CardFooter className="p-4">
                <p className="text-sm text-muted-foreground">{photo.caption}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
         <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-24 text-center">
            <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No photos yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Upload your first photo to get started.</p>
        </div>
      )}
    </div>
  );
}
