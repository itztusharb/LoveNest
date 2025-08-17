'use server';

/**
 * @fileOverview A journal management flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  addJournalEntry as addJournalEntryService,
  getJournalEntries as getJournalEntriesService,
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
    return await getJournalEntriesService(userId);
});

export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
    return await getJournalEntriesFlow(userId);
}
