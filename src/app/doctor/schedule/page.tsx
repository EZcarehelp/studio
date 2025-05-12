
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Appointment } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const mockAppointments: Appointment[] = [
  { id: 'appt1', patientId: 'p1', doctorId: 'd1', patientName: 'John Doe', patientPhone: '555-1234', date: '2024-07-15', time: '10:00 AM', issue: 'Routine Checkup', status: 'pending' },
  { id: 'appt2', patientId: 'p2', doctorId: 'd1', patientName: 'Jane Smith', patientPhone: '555-5678', date: '2024-07-15', time: '11:30 AM', issue: 'Follow-up Consultation', status: 'confirmed' },
  { id: 'appt3', patientId: 'p3', doctorId: 'd1', patientName: 'Alice Brown', patientPhone: '555-9012', date: '2024-07-16', time: '02:00 PM', issue: 'Fever and Cough', status: 'completed' },
  { id: 'appt4', patientId: 'p4', doctorId: 'd1', patientName: 'Bob Green', patientPhone: '555-3456', date: '2024-07-16', time: '03:30 PM', issue: 'Prescription Refill', status: 'cancelled' },
  { id: 'appt5', patientId: 'p5', doctorId: 'd1', patientName: 'Eve White', patientPhone: '555-7890', date: '2024-07-17', time: '09:00 AM', issue: 'Headache', status: 'confirmed' },
];

type ViewMode = "week" | "day";
type StatusFilter = "all" | Appointment['status'];

export default function DoctorSchedulePage() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const handleStatusChange = (apptId: string, newStatus: Appointment['status']) => {
    setAppointments(prev => prev.map(appt => appt.id === apptId ? { ...appt, status: newStatus } : appt));
    toast({
      title: `Appointment ${newStatus}`,
      description: `Appointment with ${appointments.find(a=>a.id === apptId)?.patientName} has been marked as ${newStatus}.`,
      variant: newStatus === 'completed' ? 'default' : newStatus === 'cancelled' ? 'destructive' : 'default', // 'success' variant can be added
    });
  };

  const filteredAppointments = appointments.filter(appt => {
    if (statusFilter === "all") return true;
    return appt.status === statusFilter;
  });

  const getStatusBadgeVariant = (status: Appointment['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'confirmed':
      case 'pending':
        return 'default'; // Blue
      case 'completed':
        return 'secondary'; // Teal (using secondary as green for now, can be changed to a dedicated success variant)
      case 'cancelled':
        return 'destructive'; // Red
      default:
        return 'outline';
    }
  };
   const getStatusBadgeClasses = (status: Appointment['status']): string => {
    switch (status) {
      case 'confirmed':
      case 'pending': // Both use primary theme color
        return 'bg-primary/20 text-primary border-primary/30';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-700/30 dark:text-green-300 dark:border-green-700/50';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-700/30 dark:text-red-300 dark:border-red-700/50';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };


  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl text-gradient">Upcoming Appointments</CardTitle>
            <CardDescription>Manage your patient schedule efficiently.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant={viewMode === 'week' ? "default" : "outline"} onClick={() => setViewMode('week')} size="sm">
              <Calendar className="mr-2 h-4 w-4" /> Week View
            </Button>
            <Button variant={viewMode === 'day' ? "default" : "outline"} onClick={() => setViewMode('day')} size="sm">
              <Clock className="mr-2 h-4 w-4" /> Day View
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" /> 
                  {statusFilter === 'all' ? 'All Statuses' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                  <DropdownMenuRadioItem value="all">All Statuses</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="pending">Pending</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="confirmed">Confirmed</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="completed">Completed</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="cancelled">Cancelled</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length > 0 ? filteredAppointments.map((appt) => (
                <TableRow key={appt.id}>
                  <TableCell className="font-medium">{appt.patientName}</TableCell>
                  <TableCell>{appt.patientPhone}</TableCell>
                  <TableCell>{appt.date} at {appt.time}</TableCell>
                  <TableCell className="max-w-xs truncate">{appt.issue}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(appt.status)} className={getStatusBadgeClasses(appt.status)}>
                      {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => handleStatusChange(appt.id, 'completed')}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Complete
                      </Button>
                    )}
                    {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleStatusChange(appt.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    No appointments match your current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
