
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppShell } from '@/components/app-shell';
import { AuthProvider } from '@/components/auth-provider';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,200..900;1,7..72,200..900&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
            <AppShell>
                {children}
            </AppShell>
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
