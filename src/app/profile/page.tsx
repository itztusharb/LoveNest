
"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile, linkPartner, getPartnerProfile } from '@/ai/flows/user-profile-flow';
import { useEffect, useState, useRef } from 'react';
import { useAuthContext } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PartyPopper, UserX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, setUser } = useAuthContext();
  const [name, setName] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partner, setPartner] = useState(null);
  const [partnerLoading, setPartnerLoading] = useState(true);

  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
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

      const fetchPartner = async () => {
        setPartnerLoading(true);
        if (user.partnerId) {
          const partnerProfile = await getPartnerProfile(user.id);
          setPartner(partnerProfile);
        } else {
          setPartner(null);
        }
        setPartnerLoading(false);
      }
      fetchPartner();

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

  const handleLinkPartner = async (e) => {
    e.preventDefault();
    if (!partnerEmail) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter your partner\'s email.' });
      return;
    }
    setIsLinking(true);
    try {
      const result = await linkPartner({ userId: user.id, partnerEmail });
      if (result.success) {
        toast({ title: 'Success!', description: result.message });
        setPartner(result.partner);
        // We need to update the local user context as well
        setUser(prevUser => ({...prevUser, partnerId: result.partner.id }));
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    } catch (error) {
       toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
    } finally {
      setIsLinking(false);
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
        <div className="lg:col-span-1 flex flex-col gap-8">
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
           <Card>
            <CardHeader>
              <CardTitle>Partner Details</CardTitle>
              <CardDescription>Your linked partner account.</CardDescription>
            </CardHeader>
            <CardContent>
              {partnerLoading ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                  </div>
                </div>
              ) : partner ? (
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={partner.photoUrl} alt={partner.name} data-ai-hint="man smiling"/>
                    <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{partner.name}</p>
                    <p className="text-sm text-muted-foreground">{partner.email}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLinkPartner} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="partnerEmail">Partner's Email</Label>
                      <Input id="partnerEmail" type="email" placeholder="partner@example.com" value={partnerEmail} onChange={(e) => setPartnerEmail(e.target.value)} />
                    </div>
                    <Button className="w-full" type="submit" disabled={isLinking}>
                      {isLinking ? 'Linking...' : 'Link Account'}
                    </Button>
                </form>
              )}
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
