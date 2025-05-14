
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CalendarDays, MapPin, Video, RefreshCw, Ban, History, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import Link from "next/link";

const initialAppointmentSettings = {
  preferredCity: "New York",
  consultationPreference: "any", // 'any', 'in-clinic', 'online'
  appointmentReminders: true,
};

export default function PatientAppointmentSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(initialAppointmentSettings);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleToggle = (key: keyof typeof initialAppointmentSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Updated Appointment Settings:", settings);
    toast({
      title: "Appointment Settings Updated (Mock)",
      description: "Your appointment preferences have been conceptually updated.",
      variant: "success"
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <CalendarDays className="mr-3 h-7 w-7" />
            Appointment Settings
          </CardTitle>
          <CardDescription>
            Manage your preferences for booking appointments, reminders, and view your appointment history.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="preferredCity" className="flex items-center"><MapPin className="w-4 h-4 mr-2 opacity-70"/>Preferred City/Location for In-Clinic Consults</Label>
              <Input id="preferredCity" name="preferredCity" value={settings.preferredCity} onChange={handleInputChange} placeholder="e.g., New York" />
            </div>

            <div className="space-y-2">
                <Label className="flex items-center"><Video className="w-4 h-4 mr-2 opacity-70"/>Consultation Preference</Label>
                 <select 
                    id="consultationPreference" 
                    name="consultationPreference" 
                    value={settings.consultationPreference} 
                    onChange={(e) => setSettings(prev => ({...prev, consultationPreference: e.target.value}))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    <option value="any">Any (In-clinic or Online)</option>
                    <option value="in-clinic">In-clinic Only</option>
                    <option value="online">Online Only</option>
                </select>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-md">
              <Label htmlFor="appointmentReminders" className="flex items-center space-x-2 cursor-pointer">
                <Bell className="w-5 h-5 text-primary" />
                <span>Enable Appointment Reminders</span>
              </Label>
              <Switch id="appointmentReminders" checked={settings.appointmentReminders} onCheckedChange={() => handleToggle('appointmentReminders')} />
            </div>

            <Button type="submit" className="w-full btn-premium rounded-md">Save Appointment Preferences</Button>
          </CardContent>
        </form>
      </Card>

       <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <History className="mr-2 h-5 w-5 text-primary" />
            Appointment History &amp; Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/patient/appointments"><CalendarDays className="mr-2 h-4 w-4"/>View My Appointments (Past &amp; Upcoming)</Link>
            </Button>
            <p className="text-xs text-muted-foreground">
                From the "My Appointments" page, you can typically cancel or request to reschedule existing appointments, and easily rebook with previous doctors.
            </p>
             <Button variant="outline" className="w-full justify-start" disabled>
                <RefreshCw className="mr-2 h-4 w-4"/>Rebook with Previous Doctors (Coming Soon)
            </Button>
             <Button variant="outline" className="w-full justify-start" disabled>
                <Ban className="mr-2 h-4 w-4"/>Cancel/Reschedule Options (Via My Appointments page)
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
