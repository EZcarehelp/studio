
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, CalendarDays, Users, Settings, LogOut, Edit2, ShieldCheck, Briefcase, Banknote, MapPin, FlaskConical } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import React from 'react'; // Ensure React is imported

// Mock auth state - replace with actual auth context/hook
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Simulate logged in
  const [user, setUser] = useState({
    name: "Dr. Emily Carter",
    email: "emily.carter@ezcare.com",
    avatarUrl: "https://picsum.photos/seed/docProfile/200/200",
    isVerified: true,
    specialty: "Cardiologist",
    location: "New York, NY" // Added location
  });

  const signOut = () => {
    setIsAuthenticated(false);
  };

  return { isAuthenticated, user, signOut };
};

export default function DoctorProfilePage() {
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
      <Card className="max-w-md mx-auto text-center shadow-lg rounded-lg">
        <CardHeader>
          <UserCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="text-2xl">Access Your Profile</CardTitle>
          <CardDescription>Sign in to manage your doctor profile and settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full btn-premium rounded-md">
            <Link href="/auth?tab=login">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const quickActions = [
    { label: "Manage Schedule", icon: <CalendarDays className="w-5 h-5" />, href: "/doctor/schedule" },
    { label: "View Patients", icon: <Users className="w-5 h-5" />, href: "/doctor/patients" },
    { label: "Consultation Settings", icon: <Settings className="w-5 h-5" />, href: "/doctor/consultations" },
    { label: "View Reports", icon: <Briefcase className="w-5 h-5" />, href: "/doctor/reports" },
  ];

  const accountSettings = [
    { label: "Professional Information", icon: <Briefcase className="w-5 h-5" />, href: "/doctor/profile/edit-professional" }, 
    { label: "Account Details", icon: <UserCircle className="w-5 h-5" />, href: "/doctor/profile/edit-account" }, 
    { label: "Payout Settings", icon: <Banknote className="w-5 h-5" />, href: "/doctor/profile/payouts" }, 
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="shadow-xl overflow-hidden rounded-lg">
        <div className="bg-gradient-to-r from-primary to-secondary p-6 relative">
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20 border-4 border-background">
              <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="doctor avatar" />
              <AvatarFallback>{user.name.substring(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-primary-foreground">{user.name}</h1>
                {user.isVerified && (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white text-xs">
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
           <Button variant="outline" size="sm" className="absolute top-4 right-4 bg-white/20 text-white hover:bg-white/30 border-white/50 rounded-md">
            <Edit2 className="w-3 h-3 mr-1.5" /> Edit Profile
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
              <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent hover:shadow-md transition-all cursor-pointer text-center h-full justify-center card-gradient">
                <div className="p-3 bg-primary/10 rounded-full mb-2 text-primary">{action.icon}</div>
                <span className="text-sm font-medium">{action.label}</span>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl">Lab Test Requests</CardTitle>
          <CardDescription>View and manage lab test requests from patients.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No pending lab test requests.</p>
          <Button variant="link" asChild className="mt-2">
            <Link href="/doctor/lab-tests/history">View History</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl">Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {accountSettings.map((setting, index) => (
            <React.Fragment key={setting.label}>
              <Link href={setting.href} passHref>
                 <div className="flex items-center justify-between p-3 rounded-md hover:bg-accent transition-colors cursor-pointer">
                  <div className="flex items-center">
                    <div className="text-primary mr-3">{setting.icon}</div>
                    <span className="text-foreground/90">{setting.label}</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <span className="text-primary">Manage <Edit2 className="inline w-3 h-3 ml-1"/></span>
                  </Button>
                </div>
              </Link>
              {index < accountSettings.length - 1 && <hr className="border-border" />}
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
