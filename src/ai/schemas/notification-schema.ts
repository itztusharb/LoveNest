import { z } from 'genkit';

export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['link_request', 'link_accepted']),
  data: z.any(),
  isRead: z.boolean(),
  createdAt: z.string(),
  linkRequestId: z.string().optional(),
});
export type Notification = z.infer<typeof NotificationSchema>;

export const LinkRequestSchema = z.object({
    id: z.string(),
    fromUserId: z.string(),
    fromUserName: z.string(),
    fromUserEmail: z.string(),
    toUserId: z.string(),
    status: z.enum(['pending', 'accepted', 'declined']),
    createdAt: z.string(),
});
export type LinkRequest = z.infer<typeof LinkRequestSchema>;
