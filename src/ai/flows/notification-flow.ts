
'use server';

/**
 * @fileOverview A notification management flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { 
    getNotifications as getNotificationsService,
    markNotificationAsRead,
    respondToLinkRequest as respondToLinkRequestService,
} from '@/services/firebase';
import { NotificationSchema } from '@/ai/schemas/notification-schema';

const getNotificationsFlow = ai.defineFlow({
    name: 'getNotificationsFlow',
    inputSchema: z.string(), // userId
    outputSchema: z.array(NotificationSchema),
}, async (userId) => {
    return await getNotificationsService(userId);
});

export async function getNotifications(userId: string) {
    return await getNotificationsFlow(userId);
}

const markAsReadFlow = ai.defineFlow({
    name: 'markAsReadFlow',
    inputSchema: z.string(), // notificationId
    outputSchema: z.void(),
}, async (notificationId) => {
    await markNotificationAsRead(notificationId);
});

export async function markAsRead(notificationId: string) {
    await markAsReadFlow(notificationId);
}

const RespondToLinkRequestInputSchema = z.object({
  linkRequestId: z.string(),
  notificationId: z.string(),
  response: z.enum(['accepted', 'declined']),
});

const respondToLinkRequestFlow = ai.defineFlow({
    name: 'respondToLinkRequestFlow',
    inputSchema: RespondToLinkRequestInputSchema,
    outputSchema: z.void(),
}, async (input) => {
    await respondToLinkRequestService(input);
});

export async function respondToLinkRequest(input) {
    await respondToLinkRequestFlow(input);
}
