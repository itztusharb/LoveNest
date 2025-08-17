"use client";

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from './user-nav';
import { Logo } from '../logo';
import Link from 'next/link';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 peer-data-[variant=inset]:left-[--sidebar-width] peer-data-[state=collapsed]:peer-data-[variant=inset]:left-[--sidebar-width-icon]">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="lg:hidden" />
        <Link href="/dashboard">
          <Logo />
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <UserNav />
        <SidebarTrigger className="hidden lg:flex" />
      </div>
    </header>
  );
}
