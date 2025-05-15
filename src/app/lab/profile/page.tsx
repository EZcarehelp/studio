
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, FlaskConical, Upload, Settings, LogOut, Edit2, MapPin, Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';

// Mock auth state - replace with actual auth context/hook
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Simulate logged in
  const [user, setUser] = useState({
    name: "Lab Technician Leo",
    email: "leo.lab@ezcare.com",
    avatarUrl: "https://placehold.co/200x200.png", // Changed placeholder
    labAffiliation: "EzCare Central Diagnostics",
    location: "Cityville, ST",
    dataAiHint: "lab worker avatar"
  });

  const signOut = () => {
    setIsAuthenticated(false);
  };

  return { isAuthenticated, user, signOut };
};

export default function LabWorkerProfilePage() {
  const { isAuthenticated, user, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = () => {
    signOut();
    toast({ title: "Signed Out", description: "You have been successfully signed out." });
    router.push('/auth'); 
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="w-full max-w-md text-center shadow-lg rounded-lg">
          <CardHeader className="items-center">
             <div className="p-4 bg-primary/10 rounded-full mb-4 inline-block">
                <UserCircle className="h-16 w-16 text-primary" />
             </div>
            <CardTitle className="text-2xl">Access Your Profile</CardTitle>
            <CardDescription>Sign in to manage your lab worker profile and tasks.</CardDescription>
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

  const quickActions = [
    { label: "View Pending Tests", icon: <FlaskConical className="w-6 h-6" />, href: "/lab/pending-tests" },
    { label: "Upload Reports", icon: <Upload className="w-6 h-6" />, href: "/lab/reports/upload" },
  ];

  const accountSettings = [
    { label: "Personal Information", icon: <UserCircle className="w-5 h-5" />, href: "/lab/profile/edit", description: "Manage name, contact, lab details." },
    { label: "Notification Settings", icon: <Bell className="w-5 h-5" />, href: "/lab/profile/notifications", description: "Control alerts for new requests, results." },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="shadow-xl overflow-hidden rounded-lg">
         <div className="bg-gradient-to-r from-primary to-secondary p-6 relative">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={user.dataAiHint || "lab worker"} />
                <AvatarFallback className="text-2xl bg-primary/30 text-primary-foreground">{user.name.substring(0,1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-primary-foreground">{user.name}</h1>
                <p className="text-sm text-primary-foreground/80">{user.email}</p>
                <p className="text-sm text-primary-foreground/80">Affiliation: {user.labAffiliation}</p>
                {user.location && (
                    <p className="text-sm text-primary-foreground/80 flex items-center"><MapPin className="w-3 h-3 mr-1.5" /> {user.location}</p>
                )}
              </div>
            </div>
             <Button variant="outline" size="sm" asChild className="absolute top-4 right-4 bg-white/20 text-white hover:bg-white/30 border-white/50 rounded-md">
              <Link href="/lab/profile/edit">
                <Edit2 className="w-3 h-3 mr-1.5" /> Edit Profile
              </Link>
            </Button>
          </div>
      </Card>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-2 gap-4">
          {quickActions.map(action => (
            <Link key={action.label} href={action.href} passHref>
              <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent hover:shadow-md transition-all cursor-pointer text-center h-full justify-center card-gradient transform hover:scale-102">
                <div className="p-3 bg-primary/10 rounded-full mb-2 text-primary">{action.icon}</div>
                <span className="text-sm font-medium">{action.label}</span>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-xl">Account Settings</CardTitle>
           <CardDescription>Manage your profile and notification preferences.</CardDescription>
        </CardHeader>
        <CardContent className="pt-3 pb-1">
          {accountSettings.map((setting, index) => (
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
              {index < accountSettings.length - 1 && <Separator/>}
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
