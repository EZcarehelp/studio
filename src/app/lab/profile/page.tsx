
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, FlaskConical, Upload, Settings, LogOut, Edit2, MapPin } from "lucide-react";
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
    avatarUrl: "https://picsum.photos/seed/labworker1/200/200",
    labAffiliation: "EzCare Central Lab",
    location: "Cityville, ST"
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
            <UserCircle className="h-16 w-16 mx-auto text-primary mb-4" />
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
    { label: "Personal Information", icon: <UserCircle className="w-5 h-5" />, href: "/lab/profile/edit", actionText: "Edit" },
    { label: "Notification Settings", icon: <Settings className="w-5 h-5" />, href: "/lab/profile/notifications", actionText: "Manage" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="shadow-xl overflow-hidden rounded-lg">
         <div className="bg-gradient-to-r from-primary to-secondary p-6 relative">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="lab worker avatar" />
                <AvatarFallback className="text-2xl bg-primary/30 text-primary-foreground">{user.name.substring(0,1)}</AvatarFallback>
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
        </CardHeader>
        <CardContent className="pt-2 pb-2">
          {accountSettings.map((setting, index) => (
            <React.Fragment key={setting.label}>
              <Link href={setting.href} passHref>
                 <div className="flex items-center justify-between py-3 rounded-md hover:bg-accent transition-colors cursor-pointer px-2 -mx-2">
                  <div className="flex items-center">
                    <div className="text-primary mr-3">{setting.icon}</div>
                    <span className="text-foreground/90">{setting.label}</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <span className="text-primary text-xs">{setting.actionText} <Edit2 className="inline w-3 h-3 ml-1 opacity-70"/></span>
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
