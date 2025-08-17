"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile, UserProfile } from '@/ai/flows/user-profile-flow';
import { useEffect, useState } from 'react';
import { getUserProfile } from '@/services/firebase';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProfile() {
      // In a real app, you'd get the user ID from authentication
      const userId = 'sample-user';
      const userProfile = await getUserProfile(userId);
      if (userProfile) {
        setProfile(userProfile);
        setName(userProfile.name);
        setAnniversary(userProfile.anniversary);
      }
    }
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile) {
      try {
        await updateUserProfile({
          ...profile,
          name,
          anniversary,
        });
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
      }
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading...
      </div>
    );
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
                <AvatarImage src={profile.photoUrl} alt="@user" data-ai-hint="woman smiling"/>
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <Button variant="outline" type="button">Change Photo</Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={profile.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="anniversary">Relationship Anniversary</Label>
              <Input id="anniversary" type="date" value={anniversary} onChange={(e) => setAnniversary(e.target.value)} />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}