
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  LineChart,
  LogOut,
  FileSpreadsheet,
  ShieldCheck,
  Menu,
  Settings,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/approvals', label: 'Approve Requests', icon: UserCheck },
  { href: '/admin/users', label: 'Manage Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: LineChart },
  { href: '/admin/logs', label: 'System Logs', icon: FileSpreadsheet },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isMobileSheetOpen, setIsMobileSheetOpen] = React.useState(false);

  // Mock sign out for admin. In real app, this would clear auth state.
  const handleAdminSignOut = () => {
    toast({ title: "Admin Signed Out" });
    router.push('/auth'); 
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/40">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col bg-background border-r p-4 space-y-2 fixed h-full">
        <div className="mb-4 px-2">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="EzCare Simplified Admin" width={140} height={40} />
          </Link>
        </div>
        <nav className="flex-grow space-y-1">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          <Button variant="ghost" onClick={handleAdminSignOut} className="w-full justify-start text-foreground/70 hover:text-destructive">
            <LogOut className="mr-3 h-5 w-5" /> Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Header & Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 h-16 flex items-center justify-between px-4 border-b bg-background">
          <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open Admin Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 pt-4">
              <SheetHeader className="px-4 pb-2 border-b">
                <Link href="/admin/dashboard" className="flex items-center gap-2" onClick={() => setIsMobileSheetOpen(false)}>
                    <Image src="/logo.svg" alt="EzCare Simplified Admin" width={140} height={40} />
                </Link>
                <SheetClose />
              </SheetHeader>
              <div className="p-4 space-y-1">
                {adminNavItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
                  return(
                  <SheetClose asChild key={item.label}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </SheetClose>
                )})}
                <SheetClose asChild>
                    <Button variant="ghost" onClick={handleAdminSignOut} className="w-full justify-start text-foreground/70 hover:text-destructive mt-4">
                        <LogOut className="mr-3 h-5 w-5" /> Logout
                    </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
           <div className="font-semibold text-lg">Admin Panel</div>
           <div className="w-8"></div> {/* Spacer for balance */}
        </header>
        
        <main className="flex-grow p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

    