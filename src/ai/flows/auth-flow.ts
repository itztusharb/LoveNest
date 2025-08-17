'use server';

/**
 * @fileOverview A user authentication and registration flow.
 *
 * - registerUser - A function that handles new user registration.
 * - RegisterUserInput - The input type for the registerUser function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  createUserWithEmail,
  getUserProfile,
  updateUserProfile,
} from '@/services/firebase';
import type { UserProfile } from '@/ai/flows/user-profile-flow';

const RegisterUserInputSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  dob: z.string(),
  anniversary: z.string(),
});
export type RegisterUserInput = z.infer<typeof RegisterUserInputSchema>;

const registerUserFlow = ai.defineFlow(
  {
    name: 'registerUserFlow',
    inputSchema: RegisterUserInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    const userCredential = await createUserWithEmail(
      input.email,
      input.password
    );
    const userId = userCredential.user.uid;

    const profile: UserProfile = {
      id: userId,
      name: input.name,
      email: input.email,
      photoUrl: `https://placehold.co/80x80.png?text=${input.name.charAt(0)}`,
      anniversary: input.anniversary,
      // We are not storing DOB in this example, but you could add it to the UserProfile schema
    };

    await updateUserProfile(profile);
  }
);

export async function registerUser(input: RegisterUserInput): Promise<void> {
  await registerUserFlow(input);
}
