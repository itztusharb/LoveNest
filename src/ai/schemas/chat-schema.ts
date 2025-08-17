import { z } from 'genkit';

export const ChatMessageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  text: z.string(),
  createdAt: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const AddChatMessageInputSchema = ChatMessageSchema.omit({ id: true, createdAt: true });
export type AddChatMessageInput = z.infer<typeof AddChatMessageInputSchema>;
