
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { UserCircle, Bell, LogOut, Leaf } from 'lucide-react'; // Added Leaf
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserRole = 'patient' | 'doctor' | 'lab_worker' | null;

interface HeaderProps {
  userRole: UserRole;
  isAuthenticated: boolean;
  onSignOut: () => void;
}

export function Header({ userRole, isAuthenticated, onSignOut }: HeaderProps) {
  const pathname = usePathname();

  const patientNavLinks = [
    { href: '/patient/find-doctors', label: 'Find Doctors' },
    { href: '/patient/store', label: 'Medicines' },
    { href: '/patient/lab-tests', label: 'Lab Tests' },
    { href: '/patient/ayurvedic-remedies', label: 'Remedies', icon: Leaf },
    { href: '/ai-symptom-checker', label: 'Symptom Checker' },
  ];

  const doctorNavLinks = [
    { href: '/doctor/dashboard', label: 'Dashboard' },
    { href: '/doctor/schedule', label: 'Schedule' },
    { href: '/doctor/patients', label: 'Patients' },
  ];
  
  const labWorkerNavLinks = [
    { href: '/lab/dashboard', label: 'Dashboard' },
    { href: '/lab/reports/upload', label: 'Upload Report' },
  ];

  const commonLinks = [
     { href: '/', label: 'Home' }
  ];
  
  let navLinks = commonLinks;
  let profileLink = '/auth';

  if (isAuthenticated) {
    if (userRole === 'patient') {
      navLinks = [...navLinks, ...patientNavLinks];
      profileLink = '/patient/profile';
    } else if (userRole === 'doctor') {
      navLinks = [...navLinks, ...doctorNavLinks];
      profileLink = '/doctor/profile';
    } else if (userRole === 'lab_worker') {
      navLinks = [...navLinks, ...labWorkerNavLinks];
      profileLink = '/lab/profile'; 
    }
  } else {
     // For unauthenticated users, show Home and Find Doctors, and maybe remedies
     navLinks = [...navLinks, 
        { href: '/patient/find-doctors', label: 'Find Doctors' },
        { href: '/patient/ayurvedic-remedies', label: 'Remedies', icon: Leaf },
    ];
  }


  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.svg"
            alt="EzCare Connect Logo"
            width={40} 
            height={40}
            priority
            className="h-8 w-auto md:h-10"
          />
           <span className="font-bold text-xl text-gradient hidden sm:inline">EzCare</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-3 lg:space-x-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary px-1.5 py-1 rounded-md flex items-center gap-1.5 ${
                pathname === link.href ? 'text-primary bg-primary/10' : 'text-foreground/80'
              }`}
            >
              {link.icon && <link.icon className="h-4 w-4 opacity-80" />}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon" className="relative rounded-full">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0.5 right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-destructive-foreground transform translate-x-1/3 -translate-y-1/3 bg-destructive rounded-full">3</span>
                <span className="sr-only">Notifications</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <UserCircle className="h-6 w-6" />
                    <span className="sr-only">User Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account ({userRole})</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={profileLink}>Profile</Link>
                  </DropdownMenuItem>
                  {userRole === 'patient' && (
                     <DropdownMenuItem asChild><Link href="/patient/appointments">My Appointments</Link></DropdownMenuItem>
                  )}
                   {userRole === 'doctor' && (
                     <DropdownMenuItem asChild><Link href="/doctor/schedule">Schedule</Link></DropdownMenuItem>
                  )}
                   {userRole === 'lab_worker' && (
                     <DropdownMenuItem asChild><Link href="/lab/dashboard">Dashboard</Link></DropdownMenuItem>
                  )}
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onSignOut} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="space-x-2">
              <Button variant="outline" asChild size="sm">
                <Link href="/auth?tab=login">Login</Link>
              </Button>
              <Button asChild className="btn-premium" size="sm">
                <Link href="/auth?tab=signup">Sign Up</Link>
              </Button>
            </div>
          )}
           {/* MobileNav Trigger for MD and below, but actual MobileNav is separate */}
           <div className="md:hidden">
            {/* Placeholder or trigger for a mobile menu if Header were to manage it.
                Currently MobileNav is separate. If a hamburger is needed here: */}
            {/* <Button variant="ghost" size="icon"><Menu className="h-6 w-6" /></Button> */}
          </div>
        </div>
      </div>
    </header>
  );
}
