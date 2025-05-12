
"use client";

import { useState, type ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, FileText, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { LabTest } from '@/types';

// Mock lab tests - in a real app, this would come from a database
const mockLabTests: LabTest[] = [
  { id: 'lt1', name: 'Complete Blood Count (CBC)', description: 'Measures different components of your blood.' },
  { id: 'lt2', name: 'Lipid Panel', description: 'Measures fats and fatty substances used as a source of energy by your body.' },
  { id: 'lt3', name: 'Basic Metabolic Panel (BMP)', description: 'Measures glucose, sodium, potassium, calcium, chloride, carbon dioxide, blood urea nitrogen and creatinine.' },
  { id: 'lt4', name: 'Urinalysis', description: 'Checks for various compounds that pass through your urine.' },
];

export default function UploadLabReportPage() {
  const { toast } = useToast();
  const [patientId, setPatientId] = useState('');
  const [selectedTestId, setSelectedTestId] = useState('');
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportFileName, setReportFileName] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReportFile(file);
      setReportFileName(file.name);
    } else {
      setReportFile(null);
      setReportFileName('');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!patientId || !selectedTestId || !reportFile) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in all required fields and select a report file.',
      });
      return;
    }

    setIsUploading(true);
    // Mock upload process
    console.log("Uploading report for patient:", patientId, "Test ID:", selectedTestId, "File:", reportFile.name, "Notes:", notes);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      variant: 'success',
      title: 'Report Uploaded Successfully',
      description: `Report for ${reportFile.name} has been uploaded for patient ${patientId}.`,
    });

    // Reset form
    setPatientId('');
    setSelectedTestId('');
    setReportFile(null);
    setReportFileName('');
    setNotes('');
    setIsUploading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <UploadCloud className="mr-3 h-7 w-7" />
            Upload Lab Report
          </CardTitle>
          <CardDescription>
            Fill in the details and upload the lab report PDF or image file for a patient.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input 
                id="patientId" 
                placeholder="Enter patient's unique ID" 
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="testType">Test Type</Label>
              <Select value={selectedTestId} onValueChange={setSelectedTestId} required>
                <SelectTrigger id="testType" className="w-full">
                  <SelectValue placeholder="Select lab test" />
                </SelectTrigger>
                <SelectContent>
                  {mockLabTests.map(test => (
                    <SelectItem key={test.id} value={test.id}>{test.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportFile">Report File (PDF, JPG, PNG)</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  id="reportFile" 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png" 
                  onChange={handleFileChange}
                  className="hidden" 
                  required
                />
                <Button type="button" variant="outline" onClick={() => document.getElementById('reportFile')?.click()} className="flex-grow justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  {reportFileName || "Choose file..."}
                </Button>
                {reportFile && <CheckCircle className="h-5 w-5 text-green-500" />}
              </div>
               {reportFileName && <p className="text-xs text-muted-foreground">Selected: {reportFileName}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                placeholder="Add any relevant notes for the doctor or patient..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full btn-premium rounded-md" disabled={isUploading}>
              {isUploading ? (
                <>
                  <UploadCloud className="mr-2 h-4 w-4 animate-pulse" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Report
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
