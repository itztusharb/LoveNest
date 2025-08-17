
"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/ai/flows/user-profile-flow';
import { useEffect, useState, useRef } from 'react';
import { useAuthContext } from '@/hooks/use-auth';

export default function ProfilePage() {
  const { user, setUser } = useAuthContext();
  const [name, setName] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);


  useEffect(() => {
    if (user) {
      setName(user.name);
      if (user.anniversary) {
        const annivDate = new Date(user.anniversary);
        const formattedAnniversary = new Date(annivDate.getTime() - annivDate.getTimezoneOffset() * 60000)
          .toISOString()
          .split('T')[0];
        setAnniversary(formattedAnniversary);
      } else {
        setAnniversary('');
      }
    }
  }, [user]);

  if (!user) {
    return null;
  }
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && user) {
      setIsUploading(true);
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
          const base64String = reader.result;
          const updatedProfile = {
            ...user,
            photoUrl: base64String,
          };
          await updateUserProfile(updatedProfile);
          setUser(updatedProfile);
          toast({
            title: 'Success!',
            description: 'Your photo has been updated.',
          });
        };
      } catch (error) {
         toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update photo.',
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user) {
      setIsSaving(true);
      try {
        const updatedProfile = {
          ...user,
          name,
          anniversary,
        };
        await updateUserProfile(updatedProfile);
        setUser(updatedProfile);
        toast({
          title: 'Success!',
          description: 'Your profile has been updated.',
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update profile.',
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and settings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
               <Avatar className="h-24 w-24">
                <AvatarImage src={user.photoUrl} alt="@user" data-ai-hint="woman smiling"/>
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="w-full">
                  <p className="text-xl font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
                <Input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    accept="image/*"
                />
                <Button 
                    variant="outline" 
                    className="w-full"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {isUploading ? "Uploading..." : "Change Photo"}
                </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Update your name and anniversary here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={user.email} disabled />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="anniversary">Relationship Anniversary</Label>
                        <Input id="anniversary" type="date" value={anniversary} onChange={(e) => setAnniversary(e.target.value)} />
                        </div>
                        <div className="flex justify-end">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
