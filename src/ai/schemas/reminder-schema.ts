import { z } from 'genkit';

export const ReminderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  date: z.string(), // ISO 8601 format
  isAnniversary: z.boolean().optional(),
});
export type Reminder = z.infer<typeof ReminderSchema>;

export const AddReminderInputSchema = ReminderSchema.omit({ id: true, isAnniversary: true });
export type AddReminderInput = z.infer<typeof AddReminderInputSchema>;
