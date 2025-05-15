
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
      // For home page, initial state is unauthenticated unless a more robust auth check is implemented
      // This example keeps it simple; real apps would check localStorage/cookies here if persistent login is desired
      currentAuth = false; 
      currentRole = null;
    }
    
    setUserRole(currentRole);
    setIsAuthenticated(currentAuth);
    setIsAuthResolved(true); // Mark auth as resolved after first check
  }, [pathname]);


  const showLayout = !pathname.startsWith('/auth');

  if (!showLayout) {
    return <main className="min-h-screen flex flex-col">{children}</main>;
  }
  
  const handleSignOut = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setIsAuthResolved(true); // Re-set auth resolved status
    // In a real app, you'd also clear tokens/session here
    if (typeof window !== 'undefined') {
      window.location.pathname = '/auth'; // Redirect to auth page
    }
  };

  // Avoid rendering Header/MobileNav with potentially incorrect auth state during initial client load
  // This is a common strategy to mitigate hydration errors related to auth state
  if (!isAuthResolved && typeof window !== 'undefined') {
     // Render nothing or a minimal loader until auth state is resolved on the client
    return <main className="min-h-screen flex flex-col">{children}</main>; 
  }

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
