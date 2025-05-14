
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, KeyRound, Smartphone, Download, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function PatientSecuritySettingsPage() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false); // Default to false for patient

  const handlePasswordChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Password Mismatch", description: "New password and confirm password do not match.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
       toast({ title: "Weak Password", description: "New password should be at least 8 characters.", variant: "destructive" });
      return;
    }
    console.log("Changing password for patient...");
    toast({ title: "Password Changed (Mock)", description: "Your password has been conceptually updated.", variant: "success" });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };
  
  const handle2FAToggle = (checked: boolean) => {
    setTwoFactorEnabled(checked);
    // In a real app, trigger 2FA setup/disable flow
    toast({ title: `2FA ${checked ? 'Enabled' : 'Disabled'} (Mock)`, variant: "success" });
  };

  const handleDownloadData = () => {
    toast({ title: "Data Download Requested (Mock)", description: "Your data download will begin shortly (conceptual)." });
  };
  
  const handleDeleteAccount = () => {
    // Add confirmation dialog here in real app
    toast({ title: "Account Deletion Requested (Mock)", description: "Your account deletion process has started (conceptual).", variant: "destructive" });
  };


  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <ShieldCheck className="mr-3 h-7 w-7" />
            Security &amp; Privacy
          </CardTitle>
          <CardDescription>
            Manage your password, two-factor authentication, and data preferences.
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

          {/* 2FA Section */}
          <div className="p-4 border rounded-md shadow-sm">
            <h3 className="font-semibold text-lg flex items-center mb-3"><Smartphone className="w-5 h-5 mr-2 text-primary"/>Two-Factor Authentication (2FA)</h3>
            <div className="flex items-center justify-between">
                <Label htmlFor="twoFactorEnabled" className="cursor-pointer">Enable 2FA (Login via OTP/Authenticator)</Label>
                <Switch id="twoFactorEnabled" checked={twoFactorEnabled} onCheckedChange={handle2FAToggle} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Adds an extra layer of security. You may need an authenticator app or receive OTPs via SMS/email.</p>
          </div>
          
          {/* Data Management Section */}
          <div className="p-4 border rounded-md shadow-sm">
            <h3 className="font-semibold text-lg flex items-center mb-3"><Download className="w-5 h-5 mr-2 text-primary"/>Data Management</h3>
            <Button variant="outline" onClick={handleDownloadData} className="w-full justify-start text-left">
              <Download className="mr-2 h-4 w-4"/> Download Your Medical Data
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Request a copy of your health records and personal information stored on EzCare Connect.</p>
          </div>
          
          {/* Delete Account Section */}
          <div className="p-4 border border-destructive/50 rounded-md shadow-sm bg-destructive/5">
            <h3 className="font-semibold text-lg flex items-center mb-3 text-destructive"><UserX className="w-5 h-5 mr-2"/>Delete Account</h3>
            <p className="text-sm text-destructive/90 mb-3">
                Permanently delete your EzCare Connect account and all associated data. This action cannot be undone.
            </p>
            <Button variant="destructive" onClick={handleDeleteAccount} className="w-full">
               Request Account Deletion
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
