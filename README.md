# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Deploying Your Application

This application is configured for deployment using **Firebase App Hosting**.

### Prerequisites

1.  Make sure you have a Firebase project.
2.  Install the Firebase CLI on your local machine:
    ```bash
    npm install -g firebase-tools
    ```
3.  Log in to your Google account using the CLI:
    ```bash
    firebase login
    ```

### Deployment Steps

1.  Navigate to the root directory of your project in your terminal.
2.  Run the following command to deploy your application:
    ```bash
    firebase deploy --only apphosting
    ```

Firebase will automatically build your Next.js application and deploy it. Once finished, the CLI will provide you with the URL where your application is live.
