
'use server';

/**
 * @fileOverview A gallery management flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  addPhoto as addPhotoService,
  getPhotos as getPhotosService,
  getUserProfile,
} from '@/services/firebase';
import { PhotoSchema, AddPhotoInputSchema } from '@/ai/schemas/gallery-schema';
import type { Photo, AddPhotoInput } from '@/ai/schemas/gallery-schema';

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
    const userProfile = await getUserProfile(userId);
    const userIdsToFetch = [userId];

    if (userProfile?.partnerId) {
      userIdsToFetch.push(userProfile.partnerId);
    }
    
    const photos = await getPhotosService(userIdsToFetch);

    // Sort all photos by date descending
    return photos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
);

export async function getPhotos(userId: string): Promise<Photo[]> {
  return await getPhotosFlow(userId);
}
