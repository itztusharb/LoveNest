import { z } from 'genkit';

export const PhotoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  src: z.string().url(),
  caption: z.string(),
  createdAt: z.string(),
  hint: z.string(),
});
export type Photo = z.infer<typeof PhotoSchema>;

export const AddPhotoInputSchema = PhotoSchema.omit({ id: true, createdAt: true });
export type AddPhotoInput = z.infer<typeof AddPhotoInputSchema>;
