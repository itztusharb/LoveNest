
'use server';

/**
 * @fileOverview A user profile management flow.
 *
 * - updateUserProfile - A function that handles updating the user profile.
 * - UserProfile - The type for the user profile data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { updateUserProfile as updateUserProfileService } from '@/services/firebase';

const UserProfileSchema = z.object({
  id: z.string().describe('The user ID.'),
  name: z.string().describe('The name of the user.'),
  email: z.string().email().describe('The email of the user.'),
  photoUrl: z.string().url().describe("The URL of the user's photo."),
  anniversary: z.string().describe('The relationship anniversary date (YYYY-MM-DD).'),
});


const updateUserProfileFlow = ai.defineFlow(
  {
    name: 'updateUserProfileFlow',
    inputSchema: UserProfileSchema,
    outputSchema: z.void(),
  },
  async (profile) => {
    await updateUserProfileService(profile);
  }
);

export async function updateUserProfile(profile) {
  await updateUserProfileFlow(profile);
}
