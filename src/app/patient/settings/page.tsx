
"use client";

import React, { useState } from 'react'; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, CalendarDays, FileText, MessageSquare, HelpCircle, Settings, MapPin, CreditCard, Bell, LogOut, Edit2, Pill, FlaskConical, CloudSun } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { useAuthState } from '@/hooks/use-auth-state'; // Import useAuthState


export default function PatientSettingsPage() {
  const { authUser, userProfile, isLoading, isAdminSession } = useAuthState(); // Use the hook
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    // In a real app, you would call your Firebase sign out function here
    // For example: await firebaseSignOutFunction();
    if (isAdminSession && typeof window !== 'undefined') {
        localStorage.removeItem('isAdminLoggedIn');
    } else if (authUser) {
        // Presuming you have a signOut function in your auth context or directly from Firebase
        // For now, simulate by clearing local state (actual Firebase signOut is in AppLayout)
        console.log("Simulating sign out for patient settings page.");
    }
    toast({ title: "Signed Out", description: "You have been successfully signed out." });
    router.push('/auth'); 
  };

  if (isLoading) {
    return (
         <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
         </div>
    );
  }


  if (!authUser && !isAdminSession) { // Check authUser from hook
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="w-full max-w-md text-center shadow-lg rounded-lg">
          <CardHeader className="items-center">
            <div className="p-4 bg-primary/10 rounded-full mb-4 inline-block">
              <UserCircle className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-2xl">Sign in to your account</CardTitle>
            <CardDescription>Access your settings to manage your health journey with EzCare Connect.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full btn-premium rounded-md">
              <Link href="/auth?tab=login">Sign In / Sign Up</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const currentUser = userProfile; // User profile from useAuthState

  // From user's list for Patient Settings
  const settingsCategories = [
    { label: "Personal Information", icon: <UserCircle className="w-5 h-5" />, href: "/patient/settings/profile-info", description: "Manage name, DOB, gender, contact, profile picture." },
    { label: "Appointment Settings", icon: <CalendarDays className="w-5 h-5" />, href: "/patient/settings/appointments", description: "Preferences, reminders, view history, manage bookings." },
    { label: "Medicine & Health Records", icon: <Pill className="w-5 h-5" />, href: "/patient/medical-records", description: "View prescriptions, lab reports, upload records." },
    { label: "Climate & Health", icon: <CloudSun className="w-5 h-5" />, href: "/patient/climate-health", description: "View weather-based health tips for your location." },
    { label: "Payments & Billing", icon: <CreditCard className="w-5 h-5" />, href: "/patient/settings/payments", description: "Manage payment methods, view invoice history." },
    { label: "Notification Settings", icon: <Bell className="w-5 h-5" />, href: "/patient/settings/notifications", description: "Control how and when you receive updates." },
    { label: "Diagnostic/Lab Test Settings", icon: <FlaskConical className="w-5 h-5" />, href: "/patient/lab-tests", description: "Track bookings, download reports." },
    { label: "Address & Delivery Settings", icon: <MapPin className="w-5 h-5" />, href: "/patient/settings/addresses", description: "Manage addresses for medicine delivery and home tests." },
    { label: "Security & Privacy", icon: <Settings className="w-5 h-5" />, href: "/patient/settings/security", description: "Change password, manage 2FA, download data." },
    { label: "Help & Support", icon: <HelpCircle className="w-5 h-5" />, href: "/support", description: "Access FAQ and contact support." },
    { label: "My Chats", icon: <MessageSquare className="w-5 h-5" />, href: "/patient/chats", description: "View your consultations with doctors." },
  ];


  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="shadow-xl overflow-hidden rounded-lg">
         <div className="bg-gradient-to-r from-primary to-secondary p-6 relative">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.name} data-ai-hint="user avatar" />
                <AvatarFallback className="text-2xl bg-primary/30 text-primary-foreground">{currentUser?.name?.substring(0,1)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-primary-foreground">{currentUser?.name || 'Patient User'}</h1>
                <p className="text-sm text-primary-foreground/80">{currentUser?.email}</p>
                {currentUser?.location && (
                  <p className="text-sm text-primary-foreground/80 flex items-center">
                    <MapPin className="w-3 h-3 mr-1.5" /> {currentUser.location}
                  </p>
                )}
              </div>
            </div>
             <Button variant="outline" size="sm" asChild className="absolute top-4 right-4 bg-white/20 text-white hover:bg-white/30 border-white/50 rounded-md">
              <Link href="/patient/settings/profile-info">
                <Edit2 className="w-3 h-3 mr-1.5" /> Edit Profile
              </Link>
            </Button>
          </div>
      </Card>

      <Card className="rounded-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-xl">Patient Settings</CardTitle>
           <CardDescription>Manage your account, preferences, and health information.</CardDescription>
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

// Simple Loader as this page now relies on authState loading
const Loader2 = ({className}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);
