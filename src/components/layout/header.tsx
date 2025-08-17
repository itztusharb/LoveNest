"use client";

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from './user-nav';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:justify-end peer-data-[variant=inset]:left-[--sidebar-width] peer-data-[state=collapsed]:peer-data-[variant=inset]:left-[--sidebar-width-icon]">
      <SidebarTrigger className="md:hidden" />
      <UserNav />
    </header>
  );
}
