
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BellIcon, Smartphone, Mail, Phone, VolumeX, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const initialNotificationSettings = {
  pushAppointments: true,
  pushOffers: false,
  emailSummaries: true,
  callReminders: false, // Future
  muteNonEssential: false,
};

export default function PatientNotificationSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(initialNotificationSettings);

  const handleToggle = (key: keyof typeof initialNotificationSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Updated Notification Settings:", settings);
    toast({
      title: "Notification Settings Updated (Mock)",
      description: "Your notification preferences have been conceptually updated.",
      variant: "success"
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <BellIcon className="mr-3 h-7 w-7" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Decide how and when you receive updates from EzCare Simplified.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-3 p-4 border rounded-md shadow-sm">
              <div className="flex items-center justify-between">
                <Label htmlFor="pushAppointments" className="flex items-center space-x-2 cursor-pointer">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <span>Push Notifications for Appointments</span>
                </Label>
                <Switch id="pushAppointments" checked={settings.pushAppointments} onCheckedChange={() => handleToggle('pushAppointments')} />
              </div>
              <p className="text-xs text-muted-foreground pl-7">Reminders, confirmations, and updates for your bookings.</p>
            </div>

            <div className="space-y-3 p-4 border rounded-md shadow-sm">
              <div className="flex items-center justify-between">
                <Label htmlFor="pushOffers" className="flex items-center space-x-2 cursor-pointer">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <span>Push Notifications for Offers &amp; Updates</span>
                </Label>
                <Switch id="pushOffers" checked={settings.pushOffers} onCheckedChange={() => handleToggle('pushOffers')} />
              </div>
               <p className="text-xs text-muted-foreground pl-7">Receive news, health tips, and promotional offers.</p>
            </div>

            <div className="space-y-3 p-4 border rounded-md shadow-sm">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailSummaries" className="flex items-center space-x-2 cursor-pointer">
                  <Mail className="w-5 h-5 text-primary" />
                  <span>Email Notifications</span>
                </Label>
                <Switch id="emailSummaries" checked={settings.emailSummaries} onCheckedChange={() => handleToggle('emailSummaries')} />
              </div>
              <p className="text-xs text-muted-foreground pl-7">Get important updates, summaries, and receipts via email.</p>
            </div>
            
             <div className="space-y-3 p-4 border rounded-md shadow-sm bg-muted/20">
              <div className="flex items-center justify-between">
                <Label htmlFor="callReminders" className="flex items-center space-x-2 text-muted-foreground">
                  <Phone className="w-5 h-5" />
                  <span>Call Reminders (Future Feature)</span>
                </Label>
                <Switch id="callReminders" checked={settings.callReminders} onCheckedChange={() => handleToggle('callReminders')} disabled />
              </div>
              <p className="text-xs text-muted-foreground pl-7">Automated call reminders for your appointments (coming soon).</p>
            </div>

             <div className="space-y-3 p-4 border rounded-md shadow-sm">
                <div className="flex items-center justify-between">
                    <Label htmlFor="muteNonEssential" className="flex items-center space-x-2 cursor-pointer">
                    <VolumeX className="w-5 h-5 text-primary" />
                    <span>Turn Off Non-Essential Alerts</span>
                    </Label>
                    <Switch id="muteNonEssential" checked={settings.muteNonEssential} onCheckedChange={() => handleToggle('muteNonEssential')} />
                </div>
                <p className="text-xs text-muted-foreground pl-7">Silence promotional or non-critical notifications.</p>
            </div>

            <Button type="submit" className="w-full btn-premium rounded-md">Save Notification Settings</Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
