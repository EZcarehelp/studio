
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, CalendarDays, Users, Settings, LogOut, Edit2, ShieldCheck, Briefcase, Banknote, MapPin, FlaskConical, FileText, BarChart3, DollarSign } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import React from 'react'; 
import { Separator } from '@/components/ui/separator';


// Mock auth state - replace with actual auth context/hook if not using AppLayout's state
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Simulate logged in
  const [user, setUser] = useState({ // This should ideally come from a global context or props
    name: "Dr. Emily Carter",
    email: "emily.carter@ezcare.com",
    avatarUrl: "https://placehold.co/200x200.png",
    isVerified: true,
    specialty: "Cardiologist",
    location: "New York, NY" 
  });

  const signOut = () => {
    setIsAuthenticated(false);
    // In a real app, you'd clear tokens/session here
  };

  return { isAuthenticated, user, signOut };
};

export default function DoctorSettingsPage() {
  const { isAuthenticated, user, signOut } = useAuth(); // Using local mock auth for now
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = () => {
    signOut(); // Clears local mock auth state
    toast({ title: "Signed Out", description: "You have been successfully signed out." });
    router.push('/auth'); // Redirect to auth page
  };

  if (!isAuthenticated || !user) {
    // This case might be handled by AppLayout or a higher-order component in a real app
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="w-full max-w-md text-center shadow-lg rounded-lg">
          <CardHeader className="items-center">
             <div className="p-4 bg-primary/10 rounded-full mb-4 inline-block">
                <UserCircle className="h-16 w-16 text-primary" />
             </div>
            <CardTitle className="text-2xl">Access Your Account</CardTitle>
            <CardDescription>Sign in to manage your doctor settings and profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full btn-premium rounded-md">
              <Link href="/auth?tab=login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Based on user's detailed list for Doctor Settings
  const settingsCategories = [
    { label: "Practice Schedule", icon: <CalendarDays className="w-5 h-5" />, href: "/doctor/settings/practice-schedule", description: "Manage clinic hours, slot durations, holidays." },
    { label: "Fee Settings", icon: <Banknote className="w-5 h-5" />, href: "/doctor/settings/fees", description: "Set in-clinic and online consultation fees." },
    { label: "Notification Settings", icon: <Settings className="w-5 h-5" />, href: "/doctor/settings/notifications", description: "Control how and when you receive alerts." }, // Changed from original profile
    { label: "Profile & Practice Info", icon: <UserCircle className="w-5 h-5" />, href: "/doctor/settings/profile-info", description: "Edit public profile, clinic details, qualifications." }, // Changed from original profile
    { label: "Prescription Settings", icon: <FileText className="w-5 h-5" />, href: "/doctor/settings/prescriptions", description: "Customize your default prescription format." },
    { label: "Reports & Analytics", icon: <BarChart3 className="w-5 h-5" />, href: "/doctor/reports", description: "View patient footfall, revenue, feedback." }, // Link to existing reports page
    { label: "Privacy & Security", icon: <ShieldCheck className="w-5 h-5" />, href: "/doctor/settings/security", description: "Change password, manage 2FA, session timeout." },
    // Adding a few more from existing quick actions or general dashboard links
    { label: "View Patients", icon: <Users className="w-5 h-5" />, href: "/doctor/patients", description: "Access your patient list and records." },
    { label: "Consultation Settings (Legacy)", icon: <DollarSign className="w-5 h-5" />, href: "/doctor/consultations", description: "Legacy consultation settings page." },
    { label: "Lab Test Requests (Mock)", icon: <FlaskConical className="w-5 h-5" />, href: "/doctor/lab-tests/history", description: "View patient lab test requests and history." },
  ];


  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="shadow-xl overflow-hidden rounded-lg">
        <div className="bg-gradient-to-r from-primary to-secondary p-6 relative">
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20 border-4 border-background shadow-md">
              <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="doctor avatar" />
              <AvatarFallback className="text-2xl bg-primary/30 text-primary-foreground">{user.name.substring(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-primary-foreground">{user.name}</h1>
                {user.isVerified && (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-primary-foreground/80">{user.email}</p>
              <p className="text-sm text-primary-foreground/80">{user.specialty}</p>
              {user.location && (
                <p className="text-sm text-primary-foreground/80 flex items-center">
                  <MapPin className="w-3 h-3 mr-1.5" /> {user.location}
                </p>
              )}
            </div>
          </div>
           <Button variant="outline" size="sm" asChild className="absolute top-4 right-4 bg-white/20 text-white hover:bg-white/30 border-white/50 rounded-md">
             <Link href="/doctor/settings/profile-info"> {/* Updated to a more specific settings sub-page */}
                <Edit2 className="w-3 h-3 mr-1.5" /> Edit Profile
             </Link>
          </Button>
        </div>
      </Card>

      <Card className="rounded-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-xl">Doctor Settings & Management</CardTitle>
          <CardDescription>Manage all aspects of your practice and account from here.</CardDescription>
        </CardHeader>
        <CardContent className="pt-3 pb-1">
          {settingsCategories.map((setting, index) => (
            <React.Fragment key={setting.label}>
              <Link href={setting.href} passHref>
                 <div className="flex items-start justify-between py-3.5 rounded-md hover:bg-accent transition-colors cursor-pointer px-2 -mx-2">
                  <div className="flex items-start">
                    <div className="text-primary mr-3 mt-0.5">{setting.icon}</div>
                    <div>
                        <span className="text-foreground/90 font-medium">{setting.label}</span>
                        <p className="text-xs text-muted-foreground">{setting.description}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="mt-1">
                    <span className="text-primary text-xs">Manage <Edit2 className="inline w-3 h-3 ml-1 opacity-70"/></span>
                  </Button>
                </div>
              </Link>
              {index < settingsCategories.length - 1 && <Separator/>}
            </React.Fragment>
          ))}
        </CardContent>
      </Card>

      <Button variant="destructive" onClick={handleSignOut} className="w-full rounded-md">
        <LogOut className="mr-2 h-4 w-4" /> Sign Out
      </Button>
    </div>
  );
}
