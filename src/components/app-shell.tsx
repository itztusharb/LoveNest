"use client";

import * as React from 'react';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Header } from '@/components/layout/header';
import { MainNav } from '@/components/layout/main-nav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen">
        <Sidebar className="bg-background">
          <MainNav />
        </Sidebar>
        <SidebarInset className="bg-background">
          <Header />
          <main className="flex-1 p-4 pt-20 sm:p-6 sm:pt-22 lg:p-8 lg:pt-24">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
