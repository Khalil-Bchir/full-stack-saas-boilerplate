'use client';

import { ModeToggle } from '@/components/layout/theme-toggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/services/hooks';
import { logout } from '@/services/v1/authSlice';
import { Globe, LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const routes = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
  },
  {
    href: '/dashboard/networks',
    label: 'Networks',
    icon: Globe,
  },
  {
    href: '/dashboard/profile',
    label: 'Profile',
    icon: User,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login'); // Redirect to login page after logout
  };
  return (
    <>
      {/* Mobile Navigation */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="fixed left-4 top-4 z-50 md:hidden">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 border-gray-800 bg-black/80 p-0 backdrop-blur-xl">
          <div className="flex h-full flex-col">
            <div className="border-b border-gray-800 p-4">
              <span className="text-lg font-semibold text-white">BlockChain Builder</span>
            </div>
            <nav className="flex flex-1 flex-col gap-2 p-4">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-gray-300 transition-colors hover:text-white',
                    pathname === route.href && 'bg-blue-500/20 text-white',
                  )}
                >
                  <route.icon className="h-5 w-5" />
                  {route.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-gray-800 p-4">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {}}
                  variant="ghost"
                  className="flex-1 text-gray-300 hover:text-white"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </Button>
                <ModeToggle />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="fixed bottom-0 left-0 top-0 z-50 hidden w-64 border-r border-gray-800 bg-black/80 backdrop-blur-xl md:flex">
        <div className="flex w-full flex-col">
          <div className="border-b border-gray-800 p-4">
            <span className="text-lg font-semibold text-white">BlockChain Builder</span>
          </div>
          <nav className="flex flex-1 flex-col gap-2 p-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-gray-300 transition-colors hover:text-white',
                  pathname === route.href && 'bg-blue-500/20 text-white',
                )}
              >
                <route.icon className="h-5 w-5" />
                {route.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-800 p-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="flex-1 text-gray-300 hover:text-white"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
