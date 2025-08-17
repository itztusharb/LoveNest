"use client";

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from './user-nav';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:justify-end peer-data-[variant=inset]:left-[--sidebar-width] peer-data-[state=collapsed]:peer-data-[variant=inset]:left-[--sidebar-width-icon]">
      <SidebarTrigger className="md:hidden" />
      <UserNav />
    </header>
  );
}
