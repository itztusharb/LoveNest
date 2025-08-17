'use server';

/**
 * @fileOverview A gallery management flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  addPhoto as addPhotoService,
  getPhotos as getPhotosService,
} from '@/services/firebase';

export const PhotoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  src: z.string().url(),
  caption: z.string(),
  createdAt: z.string(),
  hint: z.string(),
});
export type Photo = z.infer<typeof PhotoSchema>;

const AddPhotoInputSchema = PhotoSchema.omit({ id: true, createdAt: true });
export type AddPhotoInput = z.infer<typeof AddPhotoInputSchema>;

const addPhotoFlow = ai.defineFlow(
  {
    name: 'addPhotoFlow',
    inputSchema: AddPhotoInputSchema,
    outputSchema: z.void(),
  },
  async (photo) => {
    await addPhotoService(photo);
  }
);

export async function addPhoto(photo: AddPhotoInput): Promise<void> {
  await addPhotoFlow(photo);
}

const getPhotosFlow = ai.defineFlow(
  {
    name: 'getPhotosFlow',
    inputSchema: z.string(), // userId
    outputSchema: z.array(PhotoSchema),
  },
  async (userId) => {
    return await getPhotosService(userId);
  }
);

export async function getPhotos(userId: string): Promise<Photo[]> {
  return await getPhotosFlow(userId);
}
