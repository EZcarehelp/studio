
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { UserCircle, LogOut, Settings, Stethoscope, FlaskConical, ChevronDown, FileText, MessageSquare, Pill, Shield, LayoutDashboard } from 'lucide-react';
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
import { ThemeToggle } from '@/components/shared/theme-toggle';
import type { UserProfile, Doctor } from '@/types';

type AppUserProfile = (UserProfile | Doctor) & { roleActual?: UserProfile['role'] | 'doctor' };

interface HeaderProps {
  userProfile: AppUserProfile | null;
  isAuthenticated: boolean;
  isAdminSession: boolean;
  onSignOut: () => void;
}

export function Header({ userProfile, isAuthenticated, isAdminSession, onSignOut }: HeaderProps) {
  const pathname = usePathname();
  const userRole = isAdminSession ? 'admin' : userProfile?.roleActual;

  const commonBaseLinks = [
     { href: '/', label: 'Home' },
     { href: '/ai-symptom-checker', label: 'EzCare Chatbot', icon: MessageSquare },
     { href: '/patient/store', label: 'Store', icon: Pill },
  ];
  
  const patientSpecificLinks = [
     { href: '/patient/medical-records', label: 'Medical Records', icon: FileText },
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
  
  const adminHeaderLink = { href: '/admin/dashboard', label: 'Admin Panel', icon: Shield };

  let navLinks = [];
  let settingsLink = '/auth'; 
  let profileLabel = "Profile";
  let userName = userProfile?.name || "User";
  let userEmail = userProfile?.email || "";

  if (isAdminSession) {
    navLinks = [adminHeaderLink];
    settingsLink = '/admin/settings';
    profileLabel = "Admin Settings";
    userName = "Admin";
    userEmail = "ezcarehelp@gmail.com";
  } else if (isAuthenticated && userProfile) {
    if (userRole === 'patient') {
      navLinks = [...commonBaseLinks, ...patientSpecificLinks]; 
      settingsLink = '/patient/settings';
      profileLabel = "My Settings";
    } else if (userRole === 'doctor') {
      navLinks = [...commonBaseLinks, ...doctorNavLinks];
      settingsLink = '/doctor/settings';
      profileLabel = "Doctor Settings";
    } else if (userRole === 'lab_worker') {
      navLinks = [...commonBaseLinks, ...labWorkerNavLinks];
      settingsLink = '/lab/profile';
      profileLabel = "Lab Profile";
    } else { // Fallback for authenticated user with unknown/missing role in profile
        navLinks = [...commonBaseLinks];
        settingsLink = '/'; // Or a generic settings page
        profileLabel = "Settings";
    }
  } else { // Not authenticated, not admin
      navLinks = [...commonBaseLinks];
  }
  
  // Remove duplicates just in case
  navLinks = navLinks.filter((link, index, self) =>
    index === self.findIndex((l) => (l.href === link.href && l.label === link.label))
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg shadow-lg">
      <div className="container mx-auto px-4 h-[4.5rem] flex items-center justify-between">
        <Link href={userRole === 'admin' ? "/admin/dashboard" : "/"} className="flex items-center gap-2 shrink-0">
           <Image
            src="/logo.svg"
            alt="EzCare Simplified Logo"
            width={140}
            height={35}
            priority
            className="h-8 md:h-9 w-auto"
          />
        </Link>

        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link, index) => {
            const baseHref = userRole === 'admin' ? '/admin/dashboard' : '/';
            const isActive = (link.href === baseHref && pathname === baseHref) || 
                             (link.href !== baseHref && pathname.startsWith(link.href) && link.href.length > 1);
            return (
              <Link
                key={`${link.href}-${link.label}-${index}`} 
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

          {((isAuthenticated && userRole === 'patient') || (!isAuthenticated && !isAdminSession)) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "text-sm font-medium transition-colors duration-150 ease-in-out flex items-center gap-1.5 px-3 py-1.5 rounded-md",
                    (pathname.startsWith('/patient/find-doctors') || pathname.startsWith('/patient/lab-tests'))
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                  )}
                >
                  Book
                  <ChevronDown className="h-4 w-4 opacity-90" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/patient/find-doctors" className="flex items-center w-full cursor-pointer">
                    <Stethoscope className="mr-2 h-4 w-4" /> Book Doctor
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/patient/lab-tests" className="flex items-center w-full cursor-pointer">
                    <FlaskConical className="mr-2 h-4 w-4" /> Book Lab Test
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    {userProfile?.avatarUrl || userProfile?.imageUrl ? (
                        <Image src={userProfile.avatarUrl || userProfile.imageUrl!} alt={userName} width={28} height={28} className="rounded-full object-cover"/>
                    ) : (
                        <UserCircle className="h-6 w-6" />
                    )}
                    <span className="sr-only">User Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64"> {/* Increased width for email */}
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userName}</p>
                      {userEmail && <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={settingsLink} className="flex items-center w-full cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" /> {profileLabel}
                    </Link>
                  </DropdownMenuItem>
                   {userRole === 'patient' && (
                     <DropdownMenuItem asChild><Link href="/patient/appointments" className="cursor-pointer w-full">My Appointments</Link></DropdownMenuItem>
                  )}
                   {userRole === 'doctor' && (
                     <DropdownMenuItem asChild><Link href="/doctor/schedule" className="cursor-pointer w-full">Schedule</Link></DropdownMenuItem>
                  )}
                  {userRole === 'lab_worker' && (
                     <DropdownMenuItem asChild><Link href="/lab/profile" className="cursor-pointer w-full">Lab Profile</Link></DropdownMenuItem>
                  )}
                  {userRole === 'admin' && ( // Admin can also access their dashboard this way
                     <DropdownMenuItem asChild><Link href="/admin/dashboard" className="cursor-pointer w-full"><LayoutDashboard className="mr-2 h-4 w-4"/>Admin Dashboard</Link></DropdownMenuItem>
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
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild size="sm" className="rounded-md">
                <Link href="/auth?tab=login">Login</Link>
              </Button>
              <Button asChild className="btn-premium rounded-md" size="sm">
                <Link href="/auth?tab=signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
