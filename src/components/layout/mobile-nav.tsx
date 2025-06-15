
"use client";

import Link from 'next/link';
import { Home, Search, MessageCircle, User, LayoutDashboard, CalendarDays, Users, Upload, Leaf, Settings, Pill, Stethoscope, FlaskConical } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type UserRole = 'patient' | 'doctor' | 'lab_worker' | null;

interface MobileNavProps {
  userRole: UserRole;
}

const defaultNavItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/patient/find-doctors', label: 'Doctors', icon: Stethoscope },
  { href: '/patient/store', label: 'Pharmacy', icon: Pill },
  { href: '/patient/lab-tests', label: 'Lab Tests', icon: FlaskConical },
  { href: '/ai-symptom-checker', label: 'ChatBot', icon: MessageCircle },
];

const patientNavItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/patient/find-doctors', label: 'Doctors', icon: Stethoscope },
  { href: '/patient/store', label: 'Pharmacy', icon: Pill },
  { href: '/patient/lab-tests', label: 'Lab Tests', icon: FlaskConical },
  { href: '/ai-symptom-checker', label: 'ChatBot', icon: MessageCircle },
  // { href: '/patient/settings', label: 'Settings', icon: Settings }, // Settings usually in a profile menu
];

const doctorNavItems = [
  { href: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/doctor/schedule', label: 'Schedule', icon: CalendarDays },
  { href: '/doctor/patients', label: 'Patients', icon: Users },
  { href: '/doctor/settings', label: 'Settings', icon: Settings },
];

const labWorkerNavItems = [
  { href: '/lab/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/lab/reports/upload', label: 'Upload', icon: Upload },
  { href: '/lab/profile', label: 'Profile', icon: Settings },
];


export function MobileNav({ userRole }: MobileNavProps) {
  const pathname = usePathname();

  let navItemsToShow;

  if (userRole === 'patient') {
    navItemsToShow = patientNavItems;
  } else if (userRole === 'doctor') {
    navItemsToShow = doctorNavItems;
  } else if (userRole === 'lab_worker') {
    navItemsToShow = labWorkerNavItems;
  } else {
    // Unauthenticated users
    navItemsToShow = defaultNavItems;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-40">
      <div className="flex justify-around items-center h-16">
        {navItemsToShow.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && item.href.length > 1);
          return (
            <Link 
                key={item.label} 
                href={item.href} 
                className={cn(
                    "flex flex-col items-center justify-center text-center flex-1 p-1 group",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-primary/80"
                )}
            >
              <item.icon className={`h-5 w-5 mb-0.5 transition-colors`} />
              <span className={`text-xs transition-colors ${isActive ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
