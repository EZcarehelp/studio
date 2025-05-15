
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { UserCircle, Bell, LogOut, Leaf, Rss, MessageSquare, Pill, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

type UserRole = 'patient' | 'doctor' | 'lab_worker' | 'pharmacist' | null;

interface HeaderProps {
  userRole: UserRole;
  isAuthenticated: boolean;
  onSignOut: () => void;
}

export function Header({ userRole, isAuthenticated, onSignOut }: HeaderProps) {
  const pathname = usePathname();

  const patientNavLinks = [
    { href: '/patient/find-doctors', label: 'Find Doctors' },
    { href: '/patient/lab-tests', label: 'Lab Tests' },
    { href: '/patient/ayurvedic-remedies', label: 'Remedies', icon: Leaf },
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

  const pharmacistNavLinks = [
    { href: '/pharmacist/dashboard', label: 'Dashboard' },
    { href: '/patient/store', label: 'Store Mgt.' }, // Placeholder link
  ];

  const commonBaseLinks = [
     { href: '/', label: 'Home' },
     { href: '/health-news', label: 'Health News', icon: Rss },
     { href: '/ai-symptom-checker', label: 'EzCare Chatbot', icon: MessageSquare }, // Corrected href if page was renamed
     { href: '/patient/store', label: 'Store', icon: Pill },
  ];

  let navLinks = [...commonBaseLinks];
  let settingsLink = '/auth'; 
  let profileLabel = "Profile";

  if (isAuthenticated) {
    if (userRole === 'patient') {
      navLinks = [...navLinks, ...patientNavLinks];
      settingsLink = '/patient/settings';
      profileLabel = "My Settings";
    } else if (userRole === 'doctor') {
      navLinks = [...navLinks, ...doctorNavLinks];
      settingsLink = '/doctor/settings';
      profileLabel = "Doctor Settings";
    } else if (userRole === 'lab_worker') {
      navLinks = [...navLinks, ...labWorkerNavLinks];
      settingsLink = '/lab/profile'; 
      profileLabel = "Lab Profile";
    } else if (userRole === 'pharmacist') {
      navLinks = [...navLinks, ...pharmacistNavLinks];
      settingsLink = '/pharmacist/settings';
      profileLabel = "Pharmacy Settings";
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg shadow-lg">
      <div className="container mx-auto px-4 h-[4.5rem] flex items-center justify-between"> {/* Using arbitrary value for height */}
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

        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => {
            const isActive = (link.href === '/' && pathname === '/') || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={`${link.href}-${link.label}`} 
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-150 ease-in-out flex items-center gap-1.5 px-3 py-1.5 rounded-md",
                  isActive
                  ? 'text-primary bg-primary/10' 
                  : 'text-foreground/70 hover:text-primary hover:bg-primary/5' 
                )}
              >
                {link.icon && <link.icon className="h-4 w-4 opacity-90" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
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
                  <DropdownMenuLabel>My Account ({userRole || 'Guest'})</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={settingsLink} className="flex items-center w-full">
                      <Settings className="mr-2 h-4 w-4" /> {profileLabel}
                    </Link>
                  </DropdownMenuItem>
                  {userRole === 'patient' && (
                     <DropdownMenuItem asChild><Link href="/patient/appointments">My Appointments</Link></DropdownMenuItem>
                  )}
                   {userRole === 'doctor' && (
                     <DropdownMenuItem asChild><Link href="/doctor/schedule">Schedule</Link></DropdownMenuItem>
                  )}
                  {userRole === 'lab_worker' && (
                     <DropdownMenuItem asChild><Link href="/lab/profile">Lab Profile</Link></DropdownMenuItem>
                  )}
                  {userRole === 'pharmacist' && (
                     <DropdownMenuItem asChild><Link href="/pharmacist/settings">Pharmacy Settings</Link></DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onSignOut} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-3"> {/* Changed gap-2 to gap-3 for consistency */}
              <Button variant="outline" asChild size="sm" className="rounded-md">
                <Link href="/auth?tab=login">Login</Link>
              </Button>
              <Button asChild className="btn-premium rounded-md" size="sm">
                <Link href="/auth?tab=signup">Sign Up</Link>
              </Button>
            </div>
          )}
           <div className="md:hidden">
            {/* Placeholder for potential mobile menu trigger if needed differently than MobileNav */}
          </div>
        </div>
      </div>
    </header>
  );
}
