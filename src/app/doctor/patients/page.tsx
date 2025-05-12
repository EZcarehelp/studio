
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MessageSquare, FileText, UserCircle } from "lucide-react";
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface PatientListItem {
  id: string;
  name: string;
  avatarUrl: string;
  lastVisit: string; // e.g., "2 days ago", "2024-07-10"
  lastIssue: string;
  unreadMessages: number;
}

const mockPatients: PatientListItem[] = [
  { id: 'p1', name: 'John Doe', avatarUrl: 'https://picsum.photos/seed/patientA/100/100', lastVisit: '2024-07-10', lastIssue: 'Routine Checkup', unreadMessages: 0 },
  { id: 'p2', name: 'Jane Smith', avatarUrl: 'https://picsum.photos/seed/patientB/100/100', lastVisit: '2024-07-05', lastIssue: 'Follow-up Consultation', unreadMessages: 2 },
  { id: 'p3', name: 'Alice Brown', avatarUrl: 'https://picsum.photos/seed/patientC/100/100', lastVisit: '2024-06-20', lastIssue: 'Fever and Cough', unreadMessages: 0 },
  { id: 'p4', name: 'Bob Green', avatarUrl: 'https://picsum.photos/seed/patientD/100/100', lastVisit: '2024-07-12', lastIssue: 'Prescription Refill', unreadMessages: 5 },
];

export default function DoctorPatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastIssue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient">Your Patients</CardTitle>
          <CardDescription>View and manage your patient records and communications.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Input
              type="text"
              placeholder="Search patients by name or issue..."
              className="pl-10 h-10 text-base rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>

          {filteredPatients.length > 0 ? (
            <div className="space-y-4">
              {filteredPatients.map(patient => (
                <Card key={patient.id} className="rounded-lg shadow-md overflow-hidden">
                  <CardHeader className="flex flex-row items-center space-x-4 p-4 bg-muted/30">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={patient.avatarUrl} alt={patient.name} data-ai-hint="patient avatar" />
                      <AvatarFallback>{patient.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base font-medium">{patient.name}</CardTitle>
                      <CardDescription className="text-xs">Last Visit: {patient.lastVisit}</CardDescription>
                    </div>
                    {patient.unreadMessages > 0 && (
                      <Badge className="ml-auto bg-primary text-primary-foreground h-6 w-6 flex items-center justify-center rounded-full p-0">
                        {patient.unreadMessages}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm text-foreground/80 mb-1">Last Issue:</p>
                    <p className="text-sm font-medium text-foreground">{patient.lastIssue}</p>
                  </CardContent>
                  <CardFooter className="p-4 bg-muted/30 grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/doctor/patients/${patient.id}/records`}>
                        <FileText className="mr-2 h-4 w-4" /> Medical Records
                      </Link>
                    </Button>
                    <Button variant="default" size="sm" asChild className="bg-primary hover:bg-primary/90">
                       <Link href={`/doctor/chats/${patient.id}`}> {/* Assuming direct chat link */}
                        <MessageSquare className="mr-2 h-4 w-4" /> View Chat
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <UserCircle className="h-16 w-16 mx-auto mb-3" />
              <p className="text-lg">No patients found.</p>
              <p className="text-sm">Try a different search term or add new patients.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Placeholder for individual patient records page
export function PatientRecordsPage({ params }: { params: { patientId: string }}) {
    return (
        <div className="max-w-2xl mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Medical Records for Patient {params.patientId}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Details about patient {params.patientId}'s medical records will be displayed here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
