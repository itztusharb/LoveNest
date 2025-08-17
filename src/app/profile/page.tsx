"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile, UserProfile } from '@/ai/flows/user-profile-flow';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, loading: authLoading, setUser } = useAuth();
  const [name, setName] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      // Ensure anniversary is in 'yyyy-MM-dd' format for the input
      const annivDate = user.anniversary ? new Date(user.anniversary) : null;
      // Adjust for timezone differences
      const formattedAnniversary = annivDate 
        ? new Date(annivDate.getTime() - annivDate.getTimezoneOffset() * 60000).toISOString().split('T')[0]
        : '';
      setAnniversary(formattedAnniversary);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      setIsSaving(true);
      try {
        const updatedProfile: UserProfile = {
          ...user,
          name,
          anniversary,
        };
        await updateUserProfile(updatedProfile);
        // Update the user in the global auth context
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
  
  if (authLoading || !user) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information.
        </p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.photoUrl} alt="@user" data-ai-hint="woman smiling"/>
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button variant="outline" type="button">Change Photo</Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user.email} disabled />
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
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-8">
        <div>
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-4 w-1/2 mt-2" />
        </div>
        <Card className="max-w-2xl">
            <CardHeader>
                <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <Skeleton className="h-10 w-28" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-32" />
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
