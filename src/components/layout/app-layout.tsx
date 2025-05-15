
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
  const [isAuthResolved, setIsAuthResolved] = useState(false); // New state to track if auth status is resolved

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
    setIsAuthResolved(true); // Mark auth as resolved after first check
  }, [pathname]); // Only depends on pathname


  const showLayout = !pathname.startsWith('/auth');

  if (!showLayout) {
    return <main className="min-h-screen flex flex-col">{children}</main>;
  }

  // Avoid rendering Header/MobileNav with potentially incorrect auth state during initial client load
  if (!isAuthResolved && typeof window !== 'undefined') {
    // Return a structure whose root tag matches the final one to prevent hydration errors
    return (
      <div className="min-h-screen flex flex-col">
        {/* Minimal layout while auth state resolves. Header/MobileNav will render once isAuthResolved is true. */}
        <main className="flex-grow container mx-auto px-4 py-8 pt-20 md:pt-[5.5rem]">
          {children}
          {/* You could put a global loading spinner here if desired */}
        </main>
      </div>
    );
  }

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    // setIsAuthResolved(true); // No need to set here, useEffect handles it based on pathname
    if (typeof window !== 'undefined') {
      window.location.pathname = '/auth'; // Redirect to auth page
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userRole={userRole} isAuthenticated={isAuthenticated} onSignOut={handleSignOut} />
      <main className="flex-grow container mx-auto px-4 py-8 pt-20 md:pt-[5.5rem]"> {/* Adjusted padding top for header h-[4.5rem] + some breathing room */}
        {children}
      </main>
      {isAuthenticated && <MobileNav userRole={userRole} />}
    </div>
  );
}
