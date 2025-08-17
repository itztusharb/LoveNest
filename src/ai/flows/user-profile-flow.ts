
'use server';

/**
 * @fileOverview A user profile management flow.
 *
 * - updateUserProfile - A function that handles updating the user profile.
 * - UserProfile - The type for the user profile data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  updateUserProfile as updateUserProfileService,
  findUserByEmail,
  getUserProfile,
} from '@/services/firebase';

const UserProfileSchema = z.object({
  id: z.string().describe('The user ID.'),
  name: z.string().describe('The name of the user.'),
  email: z.string().email().describe('The email of the user.'),
  photoUrl: z.string().url().describe("The URL of the user's photo."),
  anniversary: z.string().describe('The relationship anniversary date (YYYY-MM-DD).'),
  partnerId: z.string().optional().describe("The ID of the user's partner."),
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

const LinkPartnerInputSchema = z.object({
  userId: z.string(),
  partnerEmail: z.string().email(),
});

const LinkPartnerOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  partner: UserProfileSchema.optional(),
});


const linkPartnerFlow = ai.defineFlow({
    name: 'linkPartnerFlow',
    inputSchema: LinkPartnerInputSchema,
    outputSchema: LinkPartnerOutputSchema,
}, async ({ userId, partnerEmail }) => {
    const partner = await findUserByEmail(partnerEmail);

    if (!partner) {
        return { success: false, message: 'No user found with that email address.' };
    }
    
    if (partner.id === userId) {
        return { success: false, message: "You cannot link to yourself." };
    }

    // Link accounts
    await updateUserProfileService({ id: userId, partnerId: partner.id });
    await updateUserProfileService({ id: partner.id, partnerId: userId });

    const updatedPartnerProfile = await getUserProfile(partner.id);

    return { success: true, message: 'Partner linked successfully!', partner: updatedPartnerProfile };
});

export async function linkPartner(input) {
    return await linkPartnerFlow(input);
}


const GetUserProfileInputSchema = z.string();

const getPartnerProfileFlow = ai.defineFlow({
    name: 'getPartnerProfileFlow',
    inputSchema: GetUserProfileInputSchema, // userId
    outputSchema: UserProfileSchema.optional(),
}, async (userId) => {
    const user = await getUserProfile(userId);
    if (user?.partnerId) {
        return await getUserProfile(user.partnerId);
    }
    return undefined;
});

export async function getPartnerProfile(userId) {
    return await getPartnerProfileFlow(userId);
}
