
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BellIcon, Smartphone, Mail, Phone, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const initialNotificationSettings = {
  pushAppointments: true,
  pushFeedback: true,
  emailAlerts: true,
  callReminders: false,
  muteDuringHours: false,
  muteStart: "22:00",
  muteEnd: "08:00",
};

export default function DoctorNotificationSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(initialNotificationSettings);

  const handleToggle = (key: keyof typeof initialNotificationSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, boundary: 'muteStart' | 'muteEnd') => {
    setSettings(prev => ({ ...prev, [boundary]: e.target.value }));
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
            Control how and when you receive alerts for appointments, feedback, and other updates.
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
              <p className="text-xs text-muted-foreground pl-7">Get instant alerts on your mobile for new bookings, cancellations, or reschedules.</p>
            </div>

            <div className="space-y-3 p-4 border rounded-md shadow-sm">
              <div className="flex items-center justify-between">
                <Label htmlFor="pushFeedback" className="flex items-center space-x-2 cursor-pointer">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <span>Push Notifications for Feedback</span>
                </Label>
                <Switch id="pushFeedback" checked={settings.pushFeedback} onCheckedChange={() => handleToggle('pushFeedback')} />
              </div>
               <p className="text-xs text-muted-foreground pl-7">Receive notifications when patients leave feedback after a consultation.</p>
            </div>

            <div className="space-y-3 p-4 border rounded-md shadow-sm">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailAlerts" className="flex items-center space-x-2 cursor-pointer">
                  <Mail className="w-5 h-5 text-primary" />
                  <span>Email Alerts</span>
                </Label>
                <Switch id="emailAlerts" checked={settings.emailAlerts} onCheckedChange={() => handleToggle('emailAlerts')} />
              </div>
              <p className="text-xs text-muted-foreground pl-7">Get email summaries or important notifications.</p>
            </div>
            
             <div className="space-y-3 p-4 border rounded-md shadow-sm">
              <div className="flex items-center justify-between">
                <Label htmlFor="callReminders" className="flex items-center space-x-2 cursor-pointer">
                  <Phone className="w-5 h-5 text-primary" />
                  <span>Call Reminders (Future Feature)</span>
                </Label>
                <Switch id="callReminders" checked={settings.callReminders} onCheckedChange={() => handleToggle('callReminders')} disabled />
              </div>
              <p className="text-xs text-muted-foreground pl-7">Automated call reminders for your upcoming appointments (coming soon).</p>
            </div>

             <div className="space-y-4 p-4 border rounded-md shadow-sm">
                <div className="flex items-center justify-between">
                    <Label htmlFor="muteDuringHours" className="flex items-center space-x-2 cursor-pointer">
                    <VolumeX className="w-5 h-5 text-primary" />
                    <span>Mute Notifications During Specific Hours</span>
                    </Label>
                    <Switch id="muteDuringHours" checked={settings.muteDuringHours} onCheckedChange={() => handleToggle('muteDuringHours')} />
                </div>
                {settings.muteDuringHours && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-7">
                        <div className="space-y-1">
                        <Label htmlFor="muteStart">Mute From</Label>
                        <Input id="muteStart" type="time" value={settings.muteStart} onChange={(e) => handleTimeChange(e, 'muteStart')} />
                        </div>
                        <div className="space-y-1">
                        <Label htmlFor="muteEnd">Mute Until</Label>
                        <Input id="muteEnd" type="time" value={settings.muteEnd} onChange={(e) => handleTimeChange(e, 'muteEnd')} />
                        </div>
                    </div>
                )}
                <p className="text-xs text-muted-foreground pl-7">Silence notifications during your off-hours or preferred quiet times.</p>
            </div>


            <Button type="submit" className="w-full btn-premium rounded-md">Save Notification Settings</Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
