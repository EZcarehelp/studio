
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { UserCircle, Bell, LogOut, Leaf, Rss } from 'lucide-react'; 
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

  const commonBaseLinks = [
     { href: '/', label: 'Home' },
     { href: '/health-news', label: 'Health News', icon: Rss },
  ];
  
  let navLinks = [...commonBaseLinks];
  let settingsLink = '/auth'; // Default to auth if not authenticated

  if (isAuthenticated) {
    if (userRole === 'patient') {
      navLinks = [...navLinks, ...patientNavLinks];
      settingsLink = '/patient/settings'; // Updated from profile to settings
    } else if (userRole === 'doctor') {
      navLinks = [...navLinks, ...doctorNavLinks];
      settingsLink = '/doctor/settings'; // Updated from profile to settings
    } else if (userRole === 'lab_worker') {
      navLinks = [...navLinks, ...labWorkerNavLinks];
      settingsLink = '/lab/profile'; // Lab worker profile/settings might still be /lab/profile or could also move to /lab/settings
                                     // For now, keeping /lab/profile as its settings structure wasn't explicitly detailed for a big change
    }
  } else {
     navLinks = [...navLinks, 
        { href: '/patient/find-doctors', label: 'Find Doctors' },
        { href: '/patient/ayurvedic-remedies', label: 'Remedies', icon: Leaf },
    ];
  }
  
  navLinks = navLinks.filter((link, index, self) =>
    index === self.findIndex((l) => (
      l.href === link.href && l.label === link.label
    ))
  );


  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
           <Image
            src="/logo.svg"
            alt="EzCare Connect Logo"
            width={140} 
            height={35} 
            priority
            className="h-8 md:h-9 w-auto" 
          />
        </Link>

        <nav className="hidden md:flex items-center space-x-2 lg:space-x-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs lg:text-sm font-medium transition-colors hover:text-primary px-1.5 py-1 rounded-md flex items-center gap-1 ${
                pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/') ? 'text-primary bg-primary/10' : 'text-foreground/80'
              }`}
            >
              {link.icon && <link.icon className="h-3.5 w-3.5 lg:h-4 lg:w-4 opacity-80" />}
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
                    <Link href={settingsLink}>Profile & Settings</Link>
                  </DropdownMenuItem>
                  {userRole === 'patient' && (
                     <DropdownMenuItem asChild><Link href="/patient/appointments">My Appointments</Link></DropdownMenuItem>
                  )}
                   {userRole === 'doctor' && (
                     <DropdownMenuItem asChild><Link href="/doctor/schedule">Schedule</Link></DropdownMenuItem>
                  )}
                   {userRole === 'lab_worker' && ( // Lab worker might still use /lab/profile if settings page not created
                     <DropdownMenuItem asChild><Link href={settingsLink}>Dashboard/Profile</Link></DropdownMenuItem>
                  )}
                  {/* Generic settings link can be removed if specific profile/settings link is present */}
                  {/* <DropdownMenuItem>Settings</DropdownMenuItem> */}
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
              <Button variant="outline" asChild size="sm" className="rounded-md">
                <Link href="/auth?tab=login">Login</Link>
              </Button>
              <Button asChild className="btn-premium rounded-md" size="sm">
                <Link href="/auth?tab=signup">Sign Up</Link>
              </Button>
            </div>
          )}
           <div className="md:hidden">
           
          </div>
        </div>
      </div>
    </header>
  );
}
