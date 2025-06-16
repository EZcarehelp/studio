
"use client";

import type { ReactNode } from 'react';
import { Header } from './header';
import { MobileNav } from './mobile-nav';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type UserRole = 'patient' | 'doctor' | 'lab_worker' | 'admin' | null;

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
    } else if (pathname.startsWith('/admin')) {
      currentRole = 'admin';
      currentAuth = true; // Assuming admin is always authenticated if on admin path for this mock
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


  const showMainLayout = !pathname.startsWith('/auth') && !pathname.startsWith('/admin');
  const showAdminLayout = pathname.startsWith('/admin'); // Admin has its own layout

  if (pathname.startsWith('/auth')) {
    return <main className="min-h-screen flex flex-col">{children}</main>;
  }

  if (showAdminLayout) {
    // Admin layout is self-contained within src/app/admin/layout.tsx
    return <>{children}</>;
  }
  
  // For other general pages and authenticated user roles (patient, doctor, lab_worker)
  if (showMainLayout) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header userRole={userRole} isAuthenticated={isAuthenticated} onSignOut={() => {
          setIsAuthenticated(false);
          setUserRole(null);
          if (typeof window !== 'undefined') {
            window.location.pathname = '/auth'; 
          }
        }} />
        <main className="flex-grow container mx-auto px-4 py-8 pt-20 md:pt-[5.5rem] pb-20 md:pb-8">
          {children}
        </main>
        {isAuthResolved && <MobileNav userRole={userRole} />}
      </div>
    );
  }
  
  // Fallback for any other case (should ideally not be hit if routing is correct)
  return <main className="min-h-screen flex flex-col">{children}</main>;
}

    