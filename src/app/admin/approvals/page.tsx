
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, BriefcaseMedical, Building, Check, X, Eye, Mail, BadgeInfo, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';

interface ApprovalRequest {
  id: string;
  type: 'doctor' | 'lab';
  name: string;
  email: string;
  details: string; // e.g., "Specialty: Cardiologist, Exp: 5 yrs" or "Lab ID: L123, Services: Blood Tests"
  documentUrl?: string; // Link to view certificate/license
  status: 'pending' | 'approved' | 'rejected';
  dateSubmitted: string;
}

const mockDoctorRequests: ApprovalRequest[] = [
  { id: 'docReq1', type: 'doctor', name: 'Dr. Ravi Sharma', email: 'ravi.sharma@email.com', details: 'MBBS, Cardiology, 5 yrs exp.', documentUrl: '#view-cert-doc1', status: 'pending', dateSubmitted: '2024-07-10' },
  { id: 'docReq2', type: 'doctor', name: 'Dr. Priya Singh', email: 'priya.singh@email.com', details: 'MD, Dermatology, 3 yrs exp.', documentUrl: '#view-cert-doc2', status: 'pending', dateSubmitted: '2024-07-11' },
];

const mockLabRequests: ApprovalRequest[] = [
  { id: 'labReq1', type: 'lab', name: 'Apollo Diagnostics Hub', email: 'contact@apollodx.com', details: 'NABL Accredited, Full Range Pathology', documentUrl: '#view-cert-lab1', status: 'pending', dateSubmitted: '2024-07-09' },
];

export default function AdminApprovalsPage() {
  const { toast } = useToast();
  const [doctorRequests, setDoctorRequests] = useState<ApprovalRequest[]>(mockDoctorRequests);
  const [labRequests, setLabRequests] = useState<ApprovalRequest[]>(mockLabRequests);

  const handleApproval = (id: string, type: 'doctor' | 'lab', approve: boolean) => {
    const updateRequests = (prevRequests: ApprovalRequest[]) => 
      prevRequests.map(req => 
        req.id === id ? { ...req, status: approve ? 'approved' : 'rejected' } : req
      );

    if (type === 'doctor') {
      setDoctorRequests(updateRequests);
    } else {
      setLabRequests(updateRequests);
    }

    const requestName = (type === 'doctor' ? doctorRequests : labRequests).find(r => r.id === id)?.name;
    toast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Request ${approve ? 'Approved' : 'Rejected'}`,
      description: `${requestName || 'The request'} has been ${approve ? 'approved' : 'rejected'}.`,
      variant: approve ? "success" : "default",
    });
    // In a real app: Update status in Firestore, send email notification.
  };

  const renderRequestCard = (request: ApprovalRequest) => (
    <Card key={request.id} className="shadow-md rounded-lg overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center">
            {request.type === 'doctor' ? <BriefcaseMedical className="w-5 h-5 mr-2 text-primary" /> : <Building className="w-5 h-5 mr-2 text-primary" />}
            {request.name}
          </CardTitle>
          <Badge variant={request.status === 'pending' ? 'outline' : request.status === 'approved' ? 'default' : 'destructive'} 
                 className={request.status === 'approved' ? 'bg-green-500/20 text-green-700 border-green-400 dark:bg-green-700/30 dark:text-green-300 dark:border-green-600' : 
                              request.status === 'rejected' ? 'bg-red-500/10 text-red-700 border-red-400 dark:bg-red-700/30 dark:text-red-300 dark:border-red-600' : ''}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Submitted: {request.dateSubmitted}</p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="flex items-center"><Mail className="w-4 h-4 mr-2 text-muted-foreground" /> {request.email}</p>
        <p className="flex items-start"><BadgeInfo className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" /> {request.details}</p>
        {request.documentUrl && (
          <Button variant="link" size="sm" asChild className="px-0 h-auto">
            <a href={request.documentUrl} target="_blank" rel="noopener noreferrer">
              <FileText className="w-4 h-4 mr-1" /> View Certificate/License
            </a>
          </Button>
        )}
      </CardContent>
      {request.status === 'pending' && (
        <CardFooter className="grid grid-cols-2 gap-2 pt-3 border-t">
          <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-700/20 dark:hover:text-green-300" onClick={() => handleApproval(request.id, request.type, true)}>
            <Check className="w-4 h-4 mr-2" /> Approve
          </Button>
          <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-700/20 dark:hover:text-red-300" onClick={() => handleApproval(request.id, request.type, false)}>
            <X className="w-4 h-4 mr-2" /> Reject
          </Button>
        </CardFooter>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <UserCheck className="mr-3 h-7 w-7" />
            Approval Requests
          </CardTitle>
          <CardDescription>
            Review and approve or reject new doctor and lab registrations.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="doctors" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="doctors">Doctor Requests ({doctorRequests.filter(r => r.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="labs">Lab Requests ({labRequests.filter(r => r.status === 'pending').length})</TabsTrigger>
        </TabsList>
        <TabsContent value="doctors" className="mt-4">
          {doctorRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctorRequests.map(renderRequestCard)}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No pending doctor requests.</p>
          )}
        </TabsContent>
        <TabsContent value="labs" className="mt-4">
          {labRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {labRequests.map(renderRequestCard)}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No pending lab requests.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

    