import { z } from 'genkit';

export const JournalEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  userPhotoUrl: z.string().url(),
  title: z.string(),
  excerpt: z.string(),
  date: z.string(),
});
export type JournalEntry = z.infer<typeof JournalEntrySchema>;

export const AddJournalEntryInputSchema = JournalEntrySchema.omit({ id: true });
export type AddJournalEntryInput = z.infer<typeof AddJournalEntryInputSchema>;
