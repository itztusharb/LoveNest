import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
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
          <form className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="https://placehold.co/80x80.png" alt="@user" data-ai-hint="woman smiling"/>
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <Button variant="outline" type="button">Change Photo</Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="User" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="user@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="anniversary">Relationship Anniversary</Label>
              <Input id="anniversary" type="date" defaultValue="2020-07-25" />
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
