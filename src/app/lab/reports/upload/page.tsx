
"use client";

import { useState, type ChangeEvent, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, FileText, CheckCircle, User, MessageSquare, Send, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { LabTest } from '@/types';
import Link from 'next/link';

const mockLabTests: LabTest[] = [
  { id: 'lt1', name: 'Complete Blood Count (CBC)', description: 'Measures different components of your blood.' },
  { id: 'lt2', name: 'Lipid Panel', description: 'Measures fats and fatty substances used as a source of energy by your body.' },
  { id: 'lt3', name: 'Basic Metabolic Panel (BMP)', description: 'Measures glucose, sodium, potassium, calcium, chloride, carbon dioxide, blood urea nitrogen and creatinine.' },
  { id: 'lt4', name: 'Urinalysis', description: 'Checks for various compounds that pass through your urine.' },
  { id: 'lt5', name: 'Thyroid Function Test (TFT)', description: 'Evaluates thyroid gland function.' },
  { id: 'lt6', name: 'Liver Function Test (LFT)', description: 'Assesses liver health.' },
];

export default function UploadLabReportPage() {
  const { toast } = useToast();
  const [patientUsername, setPatientUsername] = useState('');
  const [selectedTestId, setSelectedTestId] = useState('');
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportDataUri, setReportDataUri] = useState<string | null>(null);
  const [reportFileName, setReportFileName] = useState<string>('');
  const [messageToPatient, setMessageToPatient] = useState('');
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // Max 10MB
        toast({ variant: "destructive", title: "File too large", description: "Please upload a file smaller than 10MB." });
        return;
      }
      setReportFile(file);
      setReportFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReportDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setReportFile(null);
      setReportFileName('');
      setReportDataUri(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!patientUsername || !selectedTestId || !reportFile || !reportDataUri) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide patient username, select a test type, and choose a report file.',
      });
      return;
    }

    setIsSending(true);
    
    console.log("Sending report for patient username:", patientUsername);
    console.log("Selected Test ID:", selectedTestId);
    console.log("File Name:", reportFile.name);
    console.log("Report Data URI (first 50 chars):", reportDataUri.substring(0,50) + "...");
    console.log("Message to Patient:", messageToPatient);
    // In a real app:
    // 1. Upload reportFile/reportDataUri to secure storage (Firebase Storage, S3) get URL.
    // 2. Save report metadata (patientUsername, testId, fileURL, messageToPatient, labWorkerId, labName, timestamp) to Firestore.
    // 3. Optionally, trigger a notification to the patient.
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

    toast({
      variant: 'success',
      title: 'Report Sent Successfully',
      description: `Report "${reportFile.name}" has been sent to patient ${patientUsername}.`,
    });

    // Reset form
    setPatientUsername('');
    setSelectedTestId('');
    setReportFile(null);
    setReportFileName('');
    setReportDataUri(null);
    setMessageToPatient('');
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear file input
    }
    setIsSending(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <UploadCloud className="mr-3 h-7 w-7" />
            Upload & Send Lab Report
          </CardTitle>
          <CardDescription>
            Fill in the patient's username, test details, upload the report (PDF/Image), and send.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="patientUsername" className="flex items-center"><User className="w-4 h-4 mr-2 opacity-70"/>To (Patient's Username)</Label>
              <Input 
                id="patientUsername" 
                placeholder="Enter patient's EzCare username (e.g., patient_jane)" 
                value={patientUsername}
                onChange={(e) => setPatientUsername(e.target.value.startsWith('@') ? e.target.value : e.target.value ? `@${e.target.value}`: '')}
                required 
              />
               <p className="text-xs text-muted-foreground">Ensure the username is correct (e.g., @username). Report will be linked to this patient.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testType">Test Type</Label>
              <Select value={selectedTestId} onValueChange={setSelectedTestId} required>
                <SelectTrigger id="testType" className="w-full">
                  <SelectValue placeholder="Select lab test conducted" />
                </SelectTrigger>
                <SelectContent>
                  {mockLabTests.map(test => (
                    <SelectItem key={test.id} value={test.id}>{test.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportFile">Report File (PDF, JPG, PNG - Max 10MB)</Label>
              <div className="flex items-center space-x-2">
                <input 
                  id="reportFile" 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png" 
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden" 
                  required
                />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-grow justify-start text-muted-foreground">
                  <FileText className="mr-2 h-4 w-4" />
                  {reportFileName || "Choose file..."}
                </Button>
                {reportFile && <CheckCircle className="h-5 w-5 text-green-500" />}
              </div>
               {reportFileName && <p className="text-xs text-muted-foreground">Selected: {reportFileName}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="messageToPatient" className="flex items-center"><MessageSquare className="w-4 h-4 mr-2 opacity-70"/>Message to Patient (Optional)</Label>
              <Textarea 
                id="messageToPatient" 
                placeholder="e.g., 'CBC Report with slight deficiency. Please consult your doctor.'" 
                value={messageToPatient}
                onChange={(e) => setMessageToPatient(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="submit" className="w-full sm:w-auto btn-premium rounded-md" disabled={isSending || !reportFile || !patientUsername || !selectedTestId}>
              {isSending ? (
                <>
                  <Send className="mr-2 h-4 w-4 animate-pulse" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Report
                </>
              )}
            </Button>
            <Button type="button" variant="outline" className="w-full sm:w-auto" asChild>
                <Link href="/lab/dashboard">Cancel</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <Card className="mt-8">
        <CardHeader>
            <CardTitle className="flex items-center"><History className="mr-2 h-5 w-5 text-primary" />Sent Reports History</CardTitle>
            <CardDescription>A list of reports you've previously sent will appear here. (This feature is under development)</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
            <p>Report history tracking will be available soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
