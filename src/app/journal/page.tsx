import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { journalEntries } from '@/lib/data';

export default function JournalPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shared Journal</h1>
          <p className="text-muted-foreground">
            Your private space to share thoughts and feelings.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Entry
        </Button>
      </div>
      <div className="space-y-6">
        {journalEntries.map((entry) => (
          <Card key={entry.id}>
            <CardHeader>
              <CardTitle>{entry.title}</CardTitle>
              <CardDescription>{entry.date}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{entry.excerpt}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
