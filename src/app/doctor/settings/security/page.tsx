
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, KeyRound, Smartphone, LogOut, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function DoctorSecuritySettingsPage() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30"); // minutes

  const handlePasswordChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Password Mismatch", description: "New password and confirm password do not match.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Weak Password", description: "New password should be at least 8 characters long.", variant: "destructive" });
      return;
    }
    console.log("Changing password for doctor...");
    toast({ title: "Password Changed (Mock)", description: "Your password has been conceptually updated.", variant: "success" });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };
  
  const handleSecuritySettingsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     console.log("Saving security settings:", { twoFactorEnabled, sessionTimeout });
     toast({ title: "Security Settings Updated (Mock)", description: "2FA and session timeout settings conceptually saved.", variant: "success" });
  };


  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <ShieldCheck className="mr-3 h-7 w-7" />
            Privacy &amp; Security
          </CardTitle>
          <CardDescription>
            Manage your password, two-factor authentication, and session settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          {/* Change Password Section */}
          <form onSubmit={handlePasswordChange} className="space-y-4 p-4 border rounded-md shadow-sm">
            <h3 className="font-semibold text-lg flex items-center"><KeyRound className="w-5 h-5 mr-2 text-primary"/>Change Password</h3>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <Button type="submit" variant="outline" className="w-full">Update Password</Button>
          </form>

          {/* 2FA and Session Timeout Section */}
          <form onSubmit={handleSecuritySettingsSubmit} className="space-y-6 p-4 border rounded-md shadow-sm">
            <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center"><Smartphone className="w-5 h-5 mr-2 text-primary"/>Two-Factor Authentication (2FA)</h3>
                <div className="flex items-center justify-between">
                    <Label htmlFor="twoFactorEnabled" className="cursor-pointer">Enable 2FA</Label>
                    <Switch id="twoFactorEnabled" checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                </div>
                <p className="text-xs text-muted-foreground">Adds an extra layer of security to your account. You'll need an authenticator app.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout" className="flex items-center"><LogOut className="w-4 h-4 mr-2 opacity-70"/>Session Timeout (minutes)</Label>
              <Input id="sessionTimeout" type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} placeholder="e.g., 30" />
              <p className="text-xs text-muted-foreground">Automatically log out after a period of inactivity.</p>
            </div>
            <Button type="submit" className="w-full btn-premium">Save Security Settings</Button>
          </form>
          
          <div className="p-4 border border-dashed rounded-md bg-muted/30">
            <h3 className="font-semibold text-lg flex items-center"><UserX className="w-5 h-5 mr-2 text-destructive"/>Manage Blocked Patients</h3>
            <p className="text-sm text-muted-foreground mt-2">
                This section will allow you to view and manage any patients you've blocked. (Feature coming soon)
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
