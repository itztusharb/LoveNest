import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Gift, PlusCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

const upcomingReminders = [
  {
    id: 1,
    title: 'Our Anniversary',
    date: 'July 25, 2024',
    daysLeft: '24 days',
  },
  {
    id: 2,
    title: 'Partner\'s Birthday',
    date: 'August 18, 2024',
    daysLeft: '48 days',
  },
  {
    id: 3,
    title: 'Valentine\'s Day',
    date: 'February 14, 2025',
    daysLeft: 'long time',
  },
];

export default function RemindersPage() {
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
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Reminder
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
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
              selected={new Date()}
              className="rounded-md border"
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
            <ul className="space-y-4">
              {upcomingReminders.map((reminder) => (
                <li key={reminder.id} className="flex items-start gap-4">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Gift className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold">{reminder.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {reminder.date} ({reminder.daysLeft})
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
