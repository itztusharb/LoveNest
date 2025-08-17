
'use server';

/**
 * @fileOverview A reminder management flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  addReminder as addReminderService,
  getReminders as getRemindersService,
  deleteReminder as deleteReminderService,
  getUserProfile,
} from '@/services/firebase';
import { ReminderSchema, AddReminderInputSchema } from '@/ai/schemas/reminder-schema';
import type { Reminder, AddReminderInput } from '@/ai/schemas/reminder-schema';

const addReminderFlow = ai.defineFlow(
  {
    name: 'addReminderFlow',
    inputSchema: AddReminderInputSchema,
    outputSchema: z.void(),
  },
  async (reminder) => {
    await addReminderService(reminder);
  }
);

export async function addReminder(reminder: AddReminderInput): Promise<void> {
  await addReminderFlow(reminder);
}

const getRemindersFlow = ai.defineFlow(
  {
    name: 'getRemindersFlow',
    inputSchema: z.string(), // userId
    outputSchema: z.array(ReminderSchema),
  },
  async (userId) => {
    const userProfile = await getUserProfile(userId);
    const userIdsToFetch = [userId];
    if (userProfile?.partnerId) {
        userIdsToFetch.push(userProfile.partnerId);
    }
    return await getRemindersService(userIdsToFetch);
  }
);

export async function getReminders(userId: string): Promise<Reminder[]> {
    return await getRemindersFlow(userId);
}


const deleteReminderFlow = ai.defineFlow(
    {
        name: 'deleteReminderFlow',
        inputSchema: z.string(), // reminderId
        outputSchema: z.void(),
    },
    async (reminderId) => {
        await deleteReminderService(reminderId);
    }
);

export async function deleteReminder(reminderId: string): Promise<void> {
    await deleteReminderFlow(reminderId);
}
