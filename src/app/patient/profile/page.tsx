"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, CalendarDays, FileText, MessageSquare, HelpCircle, Settings, MapPin, CreditCard, Bell, LogOut, Edit2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation'; // For sign out redirect
import { useToast } from "@/hooks/use-toast";

// Mock auth state - replace with actual auth context/hook
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Simulate logged in
  const [user, setUser] = useState({
    name: "Jane Patient",
    email: "jane.patient@example.com",
    avatarUrl: "https://picsum.photos/seed/patient1/200/200"
  });

  const signOut = () => {
    setIsAuthenticated(false);
    // setUser(null); // Clear user data
    // In a real app, this would call your auth provider's sign out
  };

  return { isAuthenticated, user, signOut };
};

export default function PatientProfilePage() {
  const { isAuthenticated, user, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = () => {
    signOut();
    toast({ title: "Signed Out", description: "You have been successfully signed out." });
    router.push('/auth'); // Redirect to auth page
  };

  if (!isAuthenticated || !user) {
    return (
      <Card className="max-w-md mx-auto text-center shadow-lg">
        <CardHeader>
          <UserCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="text-2xl">Access Your Profile</CardTitle>
          <CardDescription>Sign in or create an account to manage your health journey with EzCare Connect.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full btn-premium">
            <Link href="/auth">Sign In / Sign Up</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const quickActions = [
    { label: "My Appointments", icon: <CalendarDays className="w-5 h-5" />, href: "/patient/appointments" },
    { label: "Medical Records", icon: <FileText className="w-5 h-5" />, href: "/patient/medical-records" },
    { label: "My Consultations", icon: <MessageSquare className="w-5 h-5" />, href: "/patient/chats" }, // Assuming consultations are chats
    { label: "Help & Support", icon: <HelpCircle className="w-5 h-5" />, href: "/support" },
  ];

  const accountSettings = [
    { label: "Personal Information", icon: <UserCircle className="w-5 h-5" />, href: "/patient/profile/edit" },
    { label: "Saved Addresses", icon: <MapPin className="w-5 h-5" />, href: "/patient/profile/addresses" },
    { label: "Payment Methods", icon: <CreditCard className="w-5 h-5" />, href: "/patient/profile/payments" },
    { label: "Notifications", icon: <Bell className="w-5 h-5" />, href: "/patient/profile/notifications" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* User Info Section */}
      <Card className="shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-secondary p-6 relative">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-4 border-background">
              <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar" />
              <AvatarFallback>{user.name.substring(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">{user.name}</h1>
              <p className="text-sm text-primary-foreground/80">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="absolute top-4 right-4 bg-white/20 text-white hover:bg-white/30 border-white/50">
            <Edit2 className="w-3 h-3 mr-1.5" /> Edit Profile
          </Button>
        </div>
      </Card>

      {/* Quick Actions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map(action => (
            <Link key={action.label} href={action.href} passHref>
              <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent hover:shadow-md transition-all cursor-pointer text-center h-full justify-center card-gradient">
                <div className="p-2 bg-primary/10 rounded-full mb-2 text-primary">{action.icon}</div>
                <span className="text-sm font-medium">{action.label}</span>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Account Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {accountSettings.map(setting => (
            <Link key={setting.label} href={setting.href} passHref>
               <div className="flex items-center p-3 rounded-md hover:bg-accent transition-colors cursor-pointer">
                <div className="text-primary mr-3">{setting.icon}</div>
                <span className="text-foreground/90">{setting.label}</span>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Sign Out Button */}
      <Button variant="destructive" onClick={handleSignOut} className="w-full">
        <LogOut className="mr-2 h-4 w-4" /> Sign Out
      </Button>
    </div>
  );
}
