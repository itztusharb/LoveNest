
'use server';

/**
 * @fileOverview A chat management flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  addChatMessage as addChatMessageService,
  getOrCreateChatId,
  updateUserLastSeen,
} from '@/services/firebase';
import { AddChatMessageInputSchema, ChatMessageSchema } from '@/ai/schemas/chat-schema';
import type { AddChatMessageInput, ChatMessage } from '@/ai/schemas/chat-schema';

const AddChatMessageInputWithUser = AddChatMessageInputSchema.extend({
    userId1: z.string(),
    userId2: z.string(),
});

const addChatMessageFlow = ai.defineFlow(
  {
    name: 'addChatMessageFlow',
    inputSchema: AddChatMessageInputWithUser,
    outputSchema: z.void(),
  },
  async (message) => {
    const chatId = await getOrCreateChatId(message.userId1, message.userId2);
    await addChatMessageService(chatId, {
      senderId: message.senderId,
      text: message.text,
    });
  }
);

export async function addChatMessage(message: z.infer<typeof AddChatMessageInputWithUser>): Promise<void> {
  await addChatMessageFlow(message);
}

const GetChatIdInputSchema = z.object({
    userId1: z.string(),
    userId2: z.string(),
});

const getChatIdFlow = ai.defineFlow({
    name: 'getChatIdFlow',
    inputSchema: GetChatIdInputSchema,
    outputSchema: z.string(),
}, async ({ userId1, userId2 }) => {
    return await getOrCreateChatId(userId1, userId2);
});

export async function getChatId(input: { userId1: string, userId2: string }): Promise<string> {
    return await getChatIdFlow(input);
}
