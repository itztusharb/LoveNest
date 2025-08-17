// This file is kept for potential future use with static data,
// but the application is now primarily fetching dynamic data from Firebase.

// Mock data for gallery photos. In a real app, this would come from a database.
export const galleryPhotos = [
    {
        id: 1,
        src: 'https://placehold.co/600x400.png',
        alt: 'A beautiful sunset over the mountains.',
        caption: 'Our first trip together.',
        hint: 'mountain sunset'
    },
    {
        id: 2,
        src: 'https://placehold.co/600x400.png',
        alt: 'A couple smiling at a cafe.',
        caption: 'Coffee dates are the best.',
        hint: 'couple cafe'
    },
    {
        id: 3,
        src: 'https://placehold.co/600x400.png',
        alt: 'A cozy fireplace.',
        caption: 'Warming up by the fire.',
        hint: 'cozy fireplace'
    },
     {
        id: 4,
        src: 'https://placehold.co/600x400.png',
        alt: 'A couple holding hands.',
        caption: 'Strolling through the park.',
        hint: 'holding hands'
    },
     {
        id: 5,
        src: 'https://placehold.co/600x400.png',
        alt: 'A picnic in a field of flowers.',
        caption: 'Summer picnic.',
        hint: 'picnic flowers'
    },
     {
        id: 6,
        src: 'https://placehold.co/600x400.png',
        alt: 'A city skyline at night.',
        caption: 'City lights.',
        hint: 'city skyline'
    },
];

// Mock data for journal entries.
export const journalEntries = [
    {
        id: 1,
        title: 'Our First Adventure',
        date: 'June 1, 2023',
        excerpt: 'We decided to go on a spontaneous road trip, and it was the best decision ever. We discovered so many hidden gems and made memories that will last a lifetime...'
    },
    {
        id: 2,
        title: 'A Quiet Evening',
        date: 'May 15, 2023',
        excerpt: 'Sometimes the best moments are the quiet ones. We stayed in, cooked dinner together, and just enjoyed each other\'s company. It was perfect.'
    },
];

// Mock data for chat messages.
export const chatMessages = [
    {
        id: 1,
        sender: 'partner',
        text: 'Hey! Thinking of you. How\'s your day going?',
        time: '10:30 AM'
    },
    {
        id: 2,
        sender: 'me',
        text: 'It\'s going well! Just grabbing a coffee. Yours?',
        time: '10:32 AM'
    },
     {
        id: 3,
        sender: 'partner',
        text: 'Same old, same old. Looking forward to seeing you tonight!',
        time: '10:33 AM'
    },
];
