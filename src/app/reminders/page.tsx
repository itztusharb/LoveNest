
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Gift, PlusCircle, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useAuthContext } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { getReminders, addReminder, deleteReminder } from '@/ai/flows/reminder-flow';
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
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays, parseISO, startOfToday, getYear } from 'date-fns';

export default function RemindersPage() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());


  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  const fetchReminders = async () => {
    if (user) {
      try {
        setLoading(true);
        const userReminders = await getReminders(user.id);
        
        let allReminders = [...userReminders];

        // Add anniversary to the list if it exists
        if (user.anniversary) {
           allReminders.push({
             id: 'anniversary',
             userId: user.id,
             title: 'Our Anniversary',
             date: user.anniversary,
             isAnniversary: true,
           });
        }
        
        // Sort reminders by date
        allReminders.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setReminders(allReminders);
      } catch (error) {
        console.error("Failed to fetch reminders", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load your reminders.',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [user]);

  const resetForm = () => {
    setTitle('');
    setDate('');
  };

  const handleSaveReminder = async (e) => {
    e.preventDefault();
    if (!title || !date || !user) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please provide a title and date.',
      });
      return;
    }

    setIsSaving(true);
    try {
      await addReminder({
        userId: user.id,
        title,
        date,
      });

      toast({
        title: 'Success!',
        description: 'Your reminder has been added.',
      });

      await fetchReminders(); // Refresh list
      setIsDialogOpen(false); // Close dialog
      resetForm();
    } catch (error) {
      console.error("Save failed", error);
      toast({
        variant: 'destructive',
        title: 'Save Error',
        description: 'Failed to save your reminder.',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteReminder = async (reminderId) => {
      if (!reminderId) return;
      try {
          await deleteReminder(reminderId);
          toast({
            title: 'Deleted',
            description: 'The reminder has been removed.',
          });
          fetchReminders(); // Refresh list
      } catch(error) {
           toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not delete the reminder.',
          });
      }
  }

  const getDaysLeftText = (reminderDateStr: string) => {
    const today = startOfToday();
    const reminderDate = parseISO(reminderDateStr);
    const thisYearAnniversary = new Date(getYear(today), reminderDate.getMonth(), reminderDate.getDate());

    let nextOccurrence = thisYearAnniversary;
    if (nextOccurrence < today) {
        nextOccurrence.setFullYear(getYear(today) + 1);
    }
    
    const days = differenceInDays(nextOccurrence, today);

    if (days === 0) return 'Today!';
    if (days === 1) return 'Tomorrow!';
    return `${days} days`;
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Important Dates
          </h1>
          <p className="text-muted-foreground">
            Never miss a special day.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Reminder</DialogTitle>
              <DialogDescription>
                Add a new important date to remember.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveReminder}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Partner's Birthday" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                 <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Reminder'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>
              View your special dates at a glance.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                  reminder: reminders.map(r => parseISO(r.date))
              }}
              modifiersStyles={{
                  reminder: {
                      color: 'hsl(var(--primary-foreground))',
                      backgroundColor: 'hsl(var(--primary))'
                  }
              }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
            <CardDescription>
              Don't forget these important dates!
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
            ) : reminders.length > 0 ? (
                <ul className="space-y-4">
                {reminders.map((reminder) => (
                    <li key={reminder.id} className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary shrink-0">
                        <Gift className="h-4 w-4" />
                    </div>
                    <div className="flex-grow">
                        <p className="font-semibold">{reminder.title}</p>
                        <p className="text-sm text-muted-foreground">
                        {format(parseISO(reminder.date), "MMMM d, yyyy")} ({getDaysLeftText(reminder.date)})
                        </p>
                    </div>
                     {!reminder.isAnniversary && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleDeleteReminder(reminder.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                     )}
                    </li>
                ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No reminders set.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
