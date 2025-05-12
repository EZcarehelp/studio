"use client";

import Link from 'next/link';
import { Home, Search, ShoppingBag, MessageCircle, User, LayoutDashboard, CalendarDays, Users, FlaskConical, Upload, Leaf } from 'lucide-react'; // Added Leaf
import { usePathname } from 'next/navigation';

type UserRole = 'patient' | 'doctor' | 'lab_worker' | null;

interface MobileNavProps {
  userRole: UserRole;
}

export function MobileNav({ userRole }: MobileNavProps) {
  const pathname = usePathname();

  const patientNavItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/patient/find-doctors', label: 'Doctors', icon: Search },
    { href: '/patient/ayurvedic-remedies', label: 'Remedies', icon: Leaf },
    { href: '/patient/chats', label: 'Chats', icon: MessageCircle },
    { href: '/patient/profile', label: 'Profile', icon: User },
  ];

  const doctorNavItems = [
    { href: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/doctor/schedule', label: 'Schedule', icon: CalendarDays },
    { href: '/doctor/patients', label: 'Patients', icon: Users },
    { href: '/doctor/profile', label: 'Profile', icon: User },
  ];

  const labWorkerNavItems = [
    { href: '/lab/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/lab/reports/upload', label: 'Upload', icon: Upload },
    { href: '/lab/profile', label: 'Profile', icon: User }, 
  ];

  let navItems = [];
  if (userRole === 'patient') {
    navItems = patientNavItems;
  } else if (userRole === 'doctor') {
    navItems = doctorNavItems;
  } else if (userRole === 'lab_worker') {
    navItems = labWorkerNavItems;
  }


  if (navItems.length === 0) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-40">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link key={item.label} href={item.href} className="flex flex-col items-center justify-center text-center flex-1 p-1 group">
              <item.icon className={`h-5 w-5 mb-0.5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/80'}`} />
              <span className={`text-xs transition-colors ${isActive ? 'text-primary font-medium' : 'text-muted-foreground group-hover:text-primary/80'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
