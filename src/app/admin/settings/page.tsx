
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Shield, Bell, Mail, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    platformName: "EzCare Simplified",
    maintenanceMode: false,
    defaultDoctorApproval: "manual", // "manual" or "auto"
    defaultLabApproval: "manual",
    adminEmail: "ezcarehelp@gmail.com",
    maxFailedLogins: 5,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Admin settings saved:", settings);
    toast({ title: "Admin Settings Saved", description: "Platform settings have been updated (mock).", variant: "success" });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <Settings className="mr-3 h-7 w-7" />
            Admin Platform Settings
          </CardTitle>
          <CardDescription>
            Manage global settings for the EzCare Simplified platform.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 pt-6">
            {/* General Settings */}
            <section className="space-y-4 p-4 border rounded-md">
              <h3 className="font-semibold text-lg flex items-center"><Settings className="w-5 h-5 mr-2 text-primary"/>General</h3>
              <div className="space-y-2">
                <Label htmlFor="platformName">Platform Name</Label>
                <Input id="platformName" name="platformName" value={settings.platformName} onChange={handleInputChange} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="maintenanceMode" className="flex-grow">Maintenance Mode</Label>
                <Switch id="maintenanceMode" checked={settings.maintenanceMode} onCheckedChange={() => handleSwitchChange('maintenanceMode')} />
              </div>
              <p className="text-xs text-muted-foreground">Enable to take the platform offline for users, showing a maintenance page.</p>
            </section>

            {/* Approval Settings */}
            <section className="space-y-4 p-4 border rounded-md">
              <h3 className="font-semibold text-lg flex items-center"><Users className="w-5 h-5 mr-2 text-primary"/>Approval Workflows</h3>
              <div className="space-y-2">
                <Label htmlFor="defaultDoctorApproval">Default Doctor Approval</Label>
                <Select id="defaultDoctorApproval" name="defaultDoctorApproval" value={settings.defaultDoctorApproval} onChange={handleInputChange}>
                    <option value="manual">Manual Review</option>
                    <option value="auto">Automatic (Not Recommended)</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultLabApproval">Default Lab Approval</Label>
                 <Select id="defaultLabApproval" name="defaultLabApproval" value={settings.defaultLabApproval} onChange={handleInputChange}>
                    <option value="manual">Manual Review</option>
                    <option value="auto">Automatic (Not Recommended)</option>
                </Select>
              </div>
            </section>

            {/* Security Settings */}
            <section className="space-y-4 p-4 border rounded-md">
              <h3 className="font-semibold text-lg flex items-center"><Shield className="w-5 h-5 mr-2 text-primary"/>Security</h3>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Primary Admin Email</Label>
                <Input id="adminEmail" name="adminEmail" type="email" value={settings.adminEmail} onChange={handleInputChange} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="maxFailedLogins">Max Failed Login Attempts (before lockout)</Label>
                <Input id="maxFailedLogins" name="maxFailedLogins" type="number" value={settings.maxFailedLogins} onChange={handleInputChange} />
              </div>
            </section>
            
            {/* Notification Settings */}
             <section className="space-y-4 p-4 border rounded-md">
                <h3 className="font-semibold text-lg flex items-center"><Bell className="w-5 h-5 mr-2 text-primary"/>Admin Notifications</h3>
                <p className="text-sm text-muted-foreground">Configure where system alerts and important notifications are sent (e.g., new approval requests, critical errors). This would typically involve email list configurations. (Placeholder for now)</p>
                <div className="space-y-2">
                    <Label htmlFor="systemAlertEmail">System Alert Email Address</Label>
                    <Input id="systemAlertEmail" placeholder="alerts@ezcaresimplified.com" disabled/>
                </div>
            </section>


            <Button type="submit" className="w-full btn-premium">Save Admin Settings</Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}

// Simple Select component for demonstration, replace with ShadCN if available
const Select = ({ id, name, value, onChange, children }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select id={id} name={name} value={value} onChange={onChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
        {children}
    </select>
);

    