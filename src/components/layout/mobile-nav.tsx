
"use client";

import Link from 'next/link';
import { Home, MessageSquare, User, LayoutDashboard, CalendarDays, Users, Upload, Settings, Pill, Stethoscope, FlaskConical, FileText, CalendarPlus, Shield, UserCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import type { UserProfile, Doctor } from '@/types';

type AppUserProfile = (UserProfile | Doctor) & { roleActual?: UserProfile['role'] | 'doctor' };

interface MobileNavProps {
  userProfile: AppUserProfile | null;
  isAdminSession: boolean;
  isAuthenticated: boolean;
}

export function MobileNav({ userProfile, isAdminSession, isAuthenticated }: MobileNavProps) {
  const pathname = usePathname();
  const [isBookSheetOpen, setIsBookSheetOpen] = React.useState(false);
  const userRole = isAdminSession ? 'admin' : userProfile?.roleActual;

  const commonNavItemsBase = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/ai-symptom-checker', label: 'ChatBot', icon: MessageSquare },
  ];

  const patientNavItems = [
    ...commonNavItemsBase,
    { href: '/patient/store', label: 'Pharmacy', icon: Pill },
    { href: isAuthenticated ? '/patient/settings' : '/auth?tab=login', label: 'Profile', icon: User }, // Dynamic Profile/Login
  ];

  const defaultNavItems = [ 
    ...commonNavItemsBase,
    { href: '/patient/store', label: 'Pharmacy', icon: Pill },
    { href: '/auth?tab=login', label: 'Profile', icon: User }, 
  ];

  const doctorNavItems = [
    { href: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/doctor/schedule', label: 'Schedule', icon: CalendarDays },
    { href: '/doctor/patients', label: 'Patients', icon: Users },
    { href: '/doctor/settings', label: 'Profile', icon: Settings },
  ];

  const labWorkerNavItems = [
    { href: '/lab/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/lab/reports/upload', label: 'Upload', icon: Upload },
    { href: '/lab/profile', label: 'Profile', icon: Settings },
  ];

  const adminMobileNavItems = [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/approvals', label: 'Approvals', icon: UserCheck },
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  let navItemsToShow;
  let showBookSheetTrigger = false;

  if (isAdminSession) {
    navItemsToShow = adminMobileNavItems;
  } else if (isAuthenticated && userProfile) {
    if (userRole === 'patient') {
      navItemsToShow = patientNavItems;
      showBookSheetTrigger = true;
    } else if (userRole === 'doctor') {
      navItemsToShow = doctorNavItems;
    } else if (userRole === 'lab_worker') {
      navItemsToShow = labWorkerNavItems;
    } else { // Authenticated but role not determined yet or unknown
      navItemsToShow = defaultNavItems; // Show default links, profile links to auth
      showBookSheetTrigger = true; // Allow booking attempts
    }
  } else { // Not authenticated
    navItemsToShow = defaultNavItems;
    showBookSheetTrigger = true;
  }
  
  if (userRole === 'admin') { // Explicitly hide book for admin
      showBookSheetTrigger = false;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-40">
      <div className="flex justify-around items-center h-16">
        {navItemsToShow.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && item.href.length > 1);
          const isAdminDashboardActive = userRole === 'admin' && item.href === '/admin/dashboard' && pathname === '/admin/dashboard';
          const finalIsActive = isAdminDashboardActive || (userRole !== 'admin' && isActive);

          return (
            <Link 
                key={item.label} 
                href={item.href} 
                className={cn(
                    "flex flex-col items-center justify-center text-center flex-1 p-1 group",
                    finalIsActive ? "text-primary" : "text-muted-foreground hover:text-primary/80"
                )}
            >
              <item.icon className={`h-5 w-5 mb-0.5 transition-colors`} />
              <span className={`text-xs transition-colors ${finalIsActive ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {showBookSheetTrigger && (
           <Sheet open={isBookSheetOpen} onOpenChange={setIsBookSheetOpen}>
            <SheetTrigger asChild>
              <button 
                className={cn(
                    "flex flex-col items-center justify-center text-center flex-1 p-1 group",
                    (pathname.startsWith('/patient/find-doctors') || pathname.startsWith('/patient/lab-tests')) ? "text-primary" : "text-muted-foreground hover:text-primary/80"
                )}
              >
                <CalendarPlus className="h-5 w-5 mb-0.5 transition-colors" />
                <span className={`text-xs transition-colors ${(pathname.startsWith('/patient/find-doctors') || pathname.startsWith('/patient/lab-tests')) ? 'font-medium' : ''}`}>
                  Book
                </span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-lg h-auto pb-6">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-center text-lg">Booking Options</SheetTitle>
                <SheetClose />
              </SheetHeader>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/patient/find-doctors" passHref legacyBehavior>
                  <a onClick={() => setIsBookSheetOpen(false)} className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer text-center card-gradient">
                    <Stethoscope className="h-8 w-8 mb-2 text-primary" />
                    <span className="text-sm font-medium">Book Doctor</span>
                  </a>
                </Link>
                <Link href="/patient/lab-tests" passHref legacyBehavior>
                  <a onClick={() => setIsBookSheetOpen(false)} className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer text-center card-gradient">
                    <FlaskConical className="h-8 w-8 mb-2 text-primary" />
                    <span className="text-sm font-medium">Book Lab Test</span>
                  </a>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </nav>
  );
}
