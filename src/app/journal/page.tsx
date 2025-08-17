
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen, Trash2 } from 'lucide-react';
import { useAuthContext } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { getJournalEntries, addJournalEntry } from '@/ai/flows/journal-flow';
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
import { format } from 'date-fns';

export default function JournalPage() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');

  const fetchEntries = async () => {
    if (user) {
      try {
        setLoading(true);
        const userEntries = await getJournalEntries(user.id);
        setEntries(userEntries);
      } catch (error) {
        console.error("Failed to fetch journal entries", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load your journal entries.',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [user]);

  const resetForm = () => {
    setTitle('');
    setExcerpt('');
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    if (!title || !excerpt || !user) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please provide a title and your thoughts.',
      });
      return;
    }

    setIsSaving(true);

    try {
      await addJournalEntry({
        userId: user.id,
        title,
        excerpt,
        date: new Date().toISOString(),
      });

      toast({
        title: 'Success!',
        description: 'Your journal entry has been saved.',
      });

      await fetchEntries(); // Refresh list
      setIsDialogOpen(false); // Close dialog
      resetForm();
    } catch (error) {
      console.error("Save failed", error);
      toast({
        variant: 'destructive',
        title: 'Save Error',
        description: 'Failed to save your journal entry.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shared Journal</h1>
          <p className="text-muted-foreground">
            Your private space to share thoughts and feelings.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Journal Entry</DialogTitle>
              <DialogDescription>
                Write down what's on your mind.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveEntry}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A beautiful day" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Your Thoughts</Label>
                  <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Today was special because..." rows={5}/>
                </div>
              </div>
              <DialogFooter>
                 <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Entry'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      ) : entries.length > 0 ? (
        <div className="space-y-6">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <CardTitle>{entry.title}</CardTitle>
                <CardDescription>
                  {format(new Date(entry.date), "MMMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap break-words">{entry.excerpt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
         <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-24 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No journal entries yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Write your first entry to get started.</p>
        </div>
      )}
    </div>
  );
}
