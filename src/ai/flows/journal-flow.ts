'use server';

/**
 * @fileOverview A journal management flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  addJournalEntry as addJournalEntryService,
  getJournalEntries as getJournalEntriesService,
  getUserProfile,
} from '@/services/firebase';
import { JournalEntrySchema, AddJournalEntryInputSchema } from '@/ai/schemas/journal-schema';
import type { JournalEntry, AddJournalEntryInput } from '@/ai/schemas/journal-schema';


const addJournalEntryFlow = ai.defineFlow(
  {
    name: 'addJournalEntryFlow',
    inputSchema: AddJournalEntryInputSchema,
    outputSchema: z.void(),
  },
  async (entry) => {
    await addJournalEntryService(entry);
  }
);

export async function addJournalEntry(entry: AddJournalEntryInput): Promise<void> {
    await addJournalEntryFlow(entry);
}

const getJournalEntriesFlow = ai.defineFlow({
    name: 'getJournalEntriesFlow',
    inputSchema: z.string(), // userId
    outputSchema: z.array(JournalEntrySchema),
}, async (userId) => {
    const userProfile = await getUserProfile(userId);
    const userIdsToFetch = [userId];
    if (userProfile?.partnerId) {
        userIdsToFetch.push(userProfile.partnerId);
    }
    
    const entries = await getJournalEntriesService(userIdsToFetch);

    // Enrich entries with user data
    const userCache = new Map();
    const enrichedEntries = await Promise.all(entries.map(async (entry) => {
        if (entry.userName && entry.userPhotoUrl) {
            return entry; // Already enriched
        }
        
        let authorProfile = userCache.get(entry.userId);
        if (!authorProfile) {
            authorProfile = await getUserProfile(entry.userId);
            if (authorProfile) {
                userCache.set(entry.userId, authorProfile);
            }
        }
        
        // If author profile still not found, we can't enrich, so we might skip this entry
        // or provide defaults. Let's provide defaults to avoid crashes.
        if (!authorProfile) {
           return {
                ...entry,
                userName: 'Unknown User',
                userPhotoUrl: `https://placehold.co/80x80.png?text=?`,
            };
        }

        return {
            ...entry,
            userName: authorProfile.name,
            userPhotoUrl: authorProfile.photoUrl,
        };
    }));
    
    // Filter out any null/undefined entries that might have been created
    return enrichedEntries.filter(Boolean) as JournalEntry[];
});

export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
    return await getJournalEntriesFlow(userId);
}
