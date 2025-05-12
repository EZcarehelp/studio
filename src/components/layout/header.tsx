
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { UserCircle, Bell, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserRole = 'patient' | 'doctor' | null;

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
    { href: '/ai-symptom-checker', label: 'Symptom Checker' },
  ];

  const doctorNavLinks = [
    { href: '/doctor/dashboard', label: 'Dashboard' },
    { href: '/doctor/schedule', label: 'Schedule' },
    { href: '/doctor/patients', label: 'Patients' },
  ];

  const commonLinks = [
     { href: '/', label: 'Home' }
  ];
  
  let navLinks = commonLinks;
  if (isAuthenticated) {
    if (userRole === 'patient') {
      navLinks = [...navLinks, ...patientNavLinks];
    } else if (userRole === 'doctor') {
      navLinks = [...navLinks, ...doctorNavLinks];
    }
  } else {
    // Unauthenticated users might see a limited set or e.g. Find Doctors if public
     navLinks = [...navLinks, { href: '/patient/find-doctors', label: 'Find Doctors' }];
  }


  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="EzCare Connect Logo"
            width={130} 
            height={45} // Adjusted height based on typical logo aspect ratio
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href ? 'text-primary border-b-2 border-primary' : 'text-foreground/80'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-destructive-foreground transform translate-x-1/2 -translate-y-1/2 bg-destructive rounded-full">3</span>
                <span className="sr-only">Notifications</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <UserCircle className="h-6 w-6" />
                    <span className="sr-only">User Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account ({userRole})</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={userRole === 'patient' ? '/patient/profile' : '/doctor/profile'}>Profile</Link>
                  </DropdownMenuItem>
                  {userRole === 'patient' && (
                     <DropdownMenuItem asChild><Link href="/patient/appointments">My Appointments</Link></DropdownMenuItem>
                  )}
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="space-x-2">
              <Button variant="outline" asChild>
                <Link href="/auth?tab=login">Login</Link>
              </Button>
              <Button asChild className="btn-premium">
                <Link href="/auth?tab=signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
