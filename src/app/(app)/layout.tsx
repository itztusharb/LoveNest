import { AppShell } from '@/components/app-shell';
import { AuthProvider } from '@/hooks/use-auth';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
