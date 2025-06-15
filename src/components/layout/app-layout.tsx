
"use client";

import type { ReactNode } from 'react';
import { Header } from './header';
import { MobileNav } from './mobile-nav';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type UserRole = 'patient' | 'doctor' | 'lab_worker' | null; // Pharmacist role removed

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
    } 
    // Removed /pharmacist path logic
     else if (pathname === '/auth') {
      currentRole = null;
      currentAuth = false;
    } else if (pathname === '/') {
      currentAuth = false;
      currentRole = null;
    }
    // If no specific role path is matched but it's not /auth or /, 
    // it's likely a generic page like /health-news, treat as unauthenticated guest for layout purposes
    // unless a global auth state indicates otherwise (not implemented yet).
    
    setUserRole(currentRole);
    setIsAuthenticated(currentAuth);
    setIsAuthResolved(true); // Mark auth as resolved after first check
  }, [pathname]);


  const showLayout = !pathname.startsWith('/auth');

  if (!showLayout) {
    return <main className="min-h-screen flex flex-col">{children}</main>;
  }
  
  // Consistent root structure for hydration
  return (
    <div className="min-h-screen flex flex-col">
      <Header userRole={userRole} isAuthenticated={isAuthenticated} onSignOut={() => {
        setIsAuthenticated(false);
        setUserRole(null);
        // A more robust navigation would use Next.js router push
        if (typeof window !== 'undefined') {
          window.location.pathname = '/auth'; 
        }
      }} />
      <main className="flex-grow container mx-auto px-4 py-8 pt-20 md:pt-[5.5rem] pb-20 md:pb-8"> {/* Added pb-20 for mobile */}
        {children}
      </main>
      {isAuthResolved && <MobileNav userRole={userRole} />}
    </div>
  );
}
