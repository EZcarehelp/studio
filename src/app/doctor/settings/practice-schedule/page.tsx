
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CalendarDays, Clock, XCircle, CalendarPlus, Coins, CalendarClock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock current schedule data - in a real app, this would be fetched and saved
const initialScheduleData = {
  clinicDays: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false },
  clinicTimings: { start: "09:00", end: "17:00" },
  breakTimings: { start: "13:00", end: "14:00", enabled: true },
  appointmentDuration: "30", // in minutes
  onlineConsultationEnabled: true,
  blockedDates: ["2024-12-25"], // Example
};

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function DoctorPracticeSchedulePage() {
  const { toast } = useToast();
  const [schedule, setSchedule] = useState(initialScheduleData);

  const handleDayToggle = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      clinicDays: { ...prev.clinicDays, [day]: !prev.clinicDays[day as keyof typeof prev.clinicDays] }
    }));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'clinic' | 'break', boundary: 'start' | 'end') => {
    const { value } = e.target;
    if (type === 'clinic') {
      setSchedule(prev => ({ ...prev, clinicTimings: { ...prev.clinicTimings, [boundary]: value }}));
    } else {
      setSchedule(prev => ({ ...prev, breakTimings: { ...prev.breakTimings, [boundary]: value }}));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend/Firebase
    console.log("Updated Practice Schedule:", schedule);
    toast({
      title: "Schedule Updated (Mock)",
      description: "Your practice schedule settings have been conceptually updated.",
      variant: "success"
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <CalendarClock className="mr-3 h-7 w-7" />
            Practice Schedule Settings
          </CardTitle>
          <CardDescription>
            Manage your clinic hours, appointment durations, holidays, and online consultation availability.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 pt-6">
            {/* Clinic Days & Timings */}
            <div className="space-y-4 p-4 border rounded-md shadow-sm">
              <h3 className="font-semibold text-lg flex items-center"><CalendarDays className="w-5 h-5 mr-2 text-primary"/>Clinic Days & Timings</h3>
              <div className="space-y-2">
                <Label>Select Clinic Days:</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {daysOfWeek.map(day => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day}`}
                        checked={schedule.clinicDays[day as keyof typeof schedule.clinicDays]}
                        onCheckedChange={() => handleDayToggle(day)}
                      />
                      <Label htmlFor={`day-${day}`} className="font-normal capitalize">{day}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="clinicStartTime">Clinic Start Time</Label>
                  <Input id="clinicStartTime" type="time" value={schedule.clinicTimings.start} onChange={(e) => handleTimeChange(e, 'clinic', 'start')} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="clinicEndTime">Clinic End Time</Label>
                  <Input id="clinicEndTime" type="time" value={schedule.clinicTimings.end} onChange={(e) => handleTimeChange(e, 'clinic', 'end')} />
                </div>
              </div>
            </div>

            {/* Break Timings */}
            <div className="space-y-4 p-4 border rounded-md shadow-sm">
              <h3 className="font-semibold text-lg flex items-center"><Clock className="w-5 h-5 mr-2 text-primary"/>Break Timings</h3>
               <div className="flex items-center space-x-2">
                <Switch id="breakEnabled" checked={schedule.breakTimings.enabled} onCheckedChange={(checked) => setSchedule(prev => ({...prev, breakTimings: {...prev.breakTimings, enabled: checked }}))} />
                <Label htmlFor="breakEnabled">Enable Lunch/Break Time</Label>
              </div>
              {schedule.breakTimings.enabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="breakStartTime">Break Start Time</Label>
                    <Input id="breakStartTime" type="time" value={schedule.breakTimings.start} onChange={(e) => handleTimeChange(e, 'break', 'start')} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="breakEndTime">Break End Time</Label>
                    <Input id="breakEndTime" type="time" value={schedule.breakTimings.end} onChange={(e) => handleTimeChange(e, 'break', 'end')} />
                  </div>
                </div>
              )}
            </div>
            
            {/* Appointment Duration */}
             <div className="space-y-2 p-4 border rounded-md shadow-sm">
                <h3 className="font-semibold text-lg flex items-center"><Coins className="w-5 h-5 mr-2 text-primary"/>Appointment Slot Settings</h3>
                <div className="space-y-1">
                    <Label htmlFor="appointmentDuration">Appointment Slot Duration</Label>
                    <Select value={schedule.appointmentDuration} onValueChange={(value) => setSchedule(prev => ({ ...prev, appointmentDuration: value }))}>
                    <SelectTrigger id="appointmentDuration">
                        <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                {/* Placeholder for Max Appointments Per Slot, Time Slot Intervals */}
                 <p className="text-xs text-muted-foreground">Max appointments per slot &amp; specific slot intervals will be configurable soon.</p>
            </div>


            {/* Online Consultation */}
            <div className="space-y-2 p-4 border rounded-md shadow-sm">
              <h3 className="font-semibold text-lg">Online Consultations</h3>
              <div className="flex items-center space-x-2">
                <Switch id="onlineConsultation" checked={schedule.onlineConsultationEnabled} onCheckedChange={(checked) => setSchedule(prev => ({...prev, onlineConsultationEnabled: checked}))} />
                <Label htmlFor="onlineConsultation">Enable Online Consultations</Label>
              </div>
            </div>

            {/* Block Dates/Holidays */}
            <div className="space-y-3 p-4 border rounded-md shadow-sm">
              <h3 className="font-semibold text-lg flex items-center"><XCircle className="w-5 h-5 mr-2 text-primary"/>Block Off Dates / Holidays</h3>
              <div className="space-y-1">
                <Label htmlFor="blockDate">Add Date to Block</Label>
                <div className="flex gap-2">
                  <Input id="blockDate" type="date" className="flex-grow"/>
                  <Button type="button" variant="outline" size="icon"><CalendarPlus className="w-4 h-4"/></Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Currently Blocked Dates:</Label>
                {schedule.blockedDates.length > 0 ? (
                  <ul className="text-sm text-muted-foreground list-disc pl-5">
                    {schedule.blockedDates.map(date => <li key={date}>{date}</li>)}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No dates currently blocked.</p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full btn-premium rounded-md">Save Schedule Settings</Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
