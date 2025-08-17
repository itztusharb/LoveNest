
"use client";

import { AppShell } from '@/components/app-shell';
import { useAuthContext } from '@/hooks/use-auth';

// 3. Update AppLayout to use the new Provider
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useAuthContext();

  // If user is not loaded yet, AuthProvider will show a loading screen.
  // if they are loaded and not present, it will redirect.
  // so if we are here, we have a user.
  if (!user) return null;

  return (
      <AppShell>{children}</AppShell>
  );
}
