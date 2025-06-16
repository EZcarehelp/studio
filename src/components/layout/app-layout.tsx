
"use client";

import type { ReactNode } from 'react';
import { Header } from './header';
import { MobileNav } from './mobile-nav';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthState } from '@/hooks/use-auth-state';
import { auth } from '@/lib/firebase/config'; // Firebase auth instance
import { Loader2 } from 'lucide-react';

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { authUser, userProfile, isLoading, isAdminSession } = useAuthState();

  const handleSignOut = async () => {
    try {
      if (isAdminSession && typeof window !== 'undefined') {
        localStorage.removeItem('isAdminLoggedIn');
      } else {
        await auth.signOut();
      }
      // The onAuthStateChanged listener in useAuthState will handle resetting user states.
      router.push('/auth'); // Redirect to auth page after sign out
    } catch (error) {
      console.error("Error signing out: ", error);
      // Potentially show a toast message for sign-out error
    }
  };
  
  const derivedUserRole = isAdminSession ? 'admin' : userProfile?.roleActual || null;
  const isAuthenticated = !!authUser || isAdminSession;

  if (isLoading && !pathname.startsWith('/auth')) { // Don't show loader on auth page itself initially
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (pathname.startsWith('/auth')) {
    return <main className="min-h-screen flex flex-col">{children}</main>;
  }

  if (derivedUserRole === 'admin' && pathname.startsWith('/admin')) {
    // Admin layout is self-contained within src/app/admin/layout.tsx
    // Ensure admin children are passed, not the main app layout structure
    return <>{children}</>;
  }
  
  // For other general pages and authenticated user roles (patient, doctor, lab_worker)
  // or if admin is on a non-admin page (should be rare)
  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        userProfile={userProfile} 
        isAuthenticated={isAuthenticated} 
        isAdminSession={isAdminSession}
        onSignOut={handleSignOut} 
      />
      <main className="flex-grow container mx-auto px-4 py-8 pt-20 md:pt-[5.5rem] pb-20 md:pb-8">
        {children}
      </main>
      <MobileNav userProfile={userProfile} isAdminSession={isAdminSession} isAuthenticated={isAuthenticated} />
    </div>
  );
}
