"use client";

import type { ReactNode } from 'react';
import { Header } from './header';
import { MobileNav } from './mobile-nav';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// Mock authentication state
// In a real app, this would come from a context or auth service
type UserRole = 'patient' | 'doctor' | null;

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<UserRole>(null); // 'patient', 'doctor', or null
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Simulate role changes based on path for demo purposes
  useEffect(() => {
    if (pathname.startsWith('/patient')) {
      setUserRole('patient');
      setIsAuthenticated(true);
    } else if (pathname.startsWith('/doctor')) {
      setUserRole('doctor');
      setIsAuthenticated(true);
    } else if (pathname === '/auth') {
      setUserRole(null);
      setIsAuthenticated(false);
    }
    // For other paths like home ('/'), assume patient or unauthenticated based on needs
    // For this demo, let's assume unauthenticated on home page if not explicitly in patient/doctor routes
    else if (pathname === '/') {
       // Keep previous role or default to null if no specific role path was hit before
    }
  }, [pathname]);


  // Hide header/nav on auth page or other specific pages if needed
  const showLayout = !pathname.startsWith('/auth');

  if (!showLayout) {
    return <main className="min-h-screen flex flex-col">{children}</main>;
  }
  
  // This is a mock function. In a real app, you'd use your auth provider's sign out method.
  const handleSignOut = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    // router.push('/auth'); // Redirect to auth page after sign out
    // For now, just log it
    console.log("User signed out");
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
