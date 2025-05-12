"use client";

import type { ReactNode } from 'react';
import { Header } from './header';
import { MobileNav } from './mobile-nav';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// Mock authentication state
// In a real app, this would come from a context or auth service
type UserRole = 'patient' | 'doctor' | 'lab_worker' | null;

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<UserRole>(null); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Simulate role changes based on path for demo purposes
  useEffect(() => {
    if (pathname.startsWith('/patient')) {
      setUserRole('patient');
      setIsAuthenticated(true);
    } else if (pathname.startsWith('/doctor')) {
      setUserRole('doctor');
      setIsAuthenticated(true);
    } else if (pathname.startsWith('/lab')) {
      setUserRole('lab_worker');
      setIsAuthenticated(true);
    }
     else if (pathname === '/auth') {
      setUserRole(null);
      setIsAuthenticated(false);
    } else if (pathname === '/') {
       // Keep previous role or default to null if no specific role path was hit before
       // if not authenticated and on home, set role to null
       if (!isAuthenticated) setUserRole(null);
    }
  }, [pathname, isAuthenticated]);


  // Hide header/nav on auth page or other specific pages if needed
  const showLayout = !pathname.startsWith('/auth');

  if (!showLayout) {
    return <main className="min-h-screen flex flex-col">{children}</main>;
  }
  
  const handleSignOut = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    // router.push('/auth'); // Ideally redirect via router after state update
    console.log("User signed out");
    // Simulate redirect by directly changing path for demo
    if (typeof window !== 'undefined') {
      window.location.pathname = '/auth';
    }
  };


  return (
    <div className="min-h-screen flex flex-col">
      <Header userRole={userRole} isAuthenticated={isAuthenticated} onSignOut={handleSignOut} />
      <main className="flex-grow container mx-auto px-4 py-8 pt-20 md:pt-24"> {/* Added padding top for fixed header */}
        {children}
      </main>
      {isAuthenticated && <MobileNav userRole={userRole} />}
    </div>
  );
}
