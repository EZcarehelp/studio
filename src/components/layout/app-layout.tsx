
"use client";

import type { ReactNode } from 'react';
import { Header } from './header';
import { MobileNav } from './mobile-nav';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type UserRole = 'patient' | 'doctor' | 'lab_worker' | 'pharmacist' | null;

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthResolved, setIsAuthResolved] = useState(false);

  useEffect(() => {
    let currentAuth = false;
    let currentRole: UserRole = null;

    if (pathname.startsWith('/patient')) {
      currentRole = 'patient';
      currentAuth = true;
    } else if (pathname.startsWith('/doctor')) {
      currentRole = 'doctor';
      currentAuth = true;
    } else if (pathname.startsWith('/lab')) {
      currentRole = 'lab_worker';
      currentAuth = true;
    } else if (pathname.startsWith('/pharmacist')) {
      currentRole = 'pharmacist';
      currentAuth = true;
    } else if (pathname === '/auth') {
      currentRole = null;
      currentAuth = false;
    } else if (pathname === '/') {
      currentAuth = false;
      currentRole = null;
    }

    setUserRole(currentRole);
    setIsAuthenticated(currentAuth);
    setIsAuthResolved(true);
  }, [pathname]);


  const showLayout = !pathname.startsWith('/auth');

  if (!showLayout) {
    return <main className="min-h-screen flex flex-col">{children}</main>;
  }

  // Removed the conditional block that caused hydration mismatch.
  // The server and initial client render will now have the same structure.
  // Header and MobileNav will render based on initial (logged-out) state,
  // then update after client-side useEffect resolves authentication.

  return (
    <div className="min-h-screen flex flex-col">
      <Header userRole={userRole} isAuthenticated={isAuthenticated} onSignOut={() => {
        setIsAuthenticated(false);
        setUserRole(null);
        if (typeof window !== 'undefined') {
          window.location.pathname = '/auth';
        }
      }} />
      <main className="flex-grow container mx-auto px-4 py-8 pt-20 md:pt-[5.5rem]"> {/* Ensure this padding accommodates header height */}
        {children}
      </main>
      {isAuthenticated && <MobileNav userRole={userRole} />}
    </div>
  );
}
