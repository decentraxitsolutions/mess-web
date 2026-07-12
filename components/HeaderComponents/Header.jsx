import React from 'react';
import Link from 'next/link';
import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';
import { Button } from '@/components/ui/button';
import { Show, SignInButton, UserButton } from '@clerk/nextjs';
import { checkUser } from '@/lib/checkUser';

const Header = async ({ user: propUser }) => {

  const user = propUser || await checkUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-linear-to-br from-blue-600 to-indigo-600 text-white font-bold shadow-sm transition-transform group-hover:scale-105">
              M
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 transition-opacity group-hover:opacity-80">
              MessApp
            </span>
          </Link>
          <DesktopNav />
        </div>

        <div className="flex items-center gap-3">
          <Show when="signed-in">
            <Link href="/login-redirect">
              <Button variant="outline" size="sm" className="rounded-full">
                Dashboard
              </Button>
            </Link>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
          </Show>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button size="sm" className="hidden sm:inline-flex rounded-full px-5 font-medium transition-all hover:shadow-md">
                Sign In
              </Button>
            </SignInButton>
          </Show>
          <MobileNav />
        </div>
      </div>
    </header>
  );
};

export default Header;
