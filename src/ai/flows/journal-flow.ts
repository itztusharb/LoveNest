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
    
    // Entries are already sorted by the service function
    return entries;
});

export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
    return await getJournalEntriesFlow(userId);
}
