
"use client";

import * as React from 'react';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Header } from '@/components/layout/header';
import { MainNav } from '@/components/layout/main-nav';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChatPage = pathname.includes('/chat');

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen">
        <Sidebar className="bg-background">
          <MainNav />
        </Sidebar>
        <SidebarInset className="bg-background">
          <Header />
          <main className={cn(
            "flex-1 p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8 lg:pt-20",
             isChatPage && "flex flex-col"
          )}>
             <div className={cn(
                "mx-auto max-w-7xl",
                isChatPage && "flex flex-1 flex-col self-stretch"
             )}>
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
