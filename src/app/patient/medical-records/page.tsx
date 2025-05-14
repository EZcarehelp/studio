
"use client";

import { useState, useRef, type ChangeEvent } from 'react'; // Added useRef and ChangeEvent
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, BarChart, Brain, Image as ImageIcon, AlertTriangle, FlaskConical } from "lucide-react"; // Added AlertTriangle, FlaskConical
import type { LabReport } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { aiDietPlanFromReportImage } from '@/ai/flows/ai-diet-plan-flow';
import Image from "next/image";
import { Input } from '@/components/ui/input'; // Added Input
import { Label } from '@/components/ui/label'; // Added Label
import React from 'react'; // Ensured React is imported

// Mock current user ID for simulation
const MOCK_CURRENT_USER_ID = 'user123';

// Mock lab reports data - added one for a different patient
const mockLabReports: LabReport[] = [
  {
    id: 'report1',
    patientId: 'user123',
    patientName: 'Jane Patient',
    testId: 'lt1',
    testName: 'Complete Blood Count (CBC)',
    reportImageUrl: 'https://placehold.co/600x800.png', 
    reportDataUri: '', 
    dateUploaded: Date.now() - 1000 * 60 * 60 * 24 * 5, 
    notesByLabWorker: 'Standard CBC panel. Results within normal ranges.',
    status: 'analysis_complete',
    dataAiHint: 'lab report'
  },
  {
    id: 'report2',
    patientId: 'user123',
    patientName: 'Jane Patient',
    testId: 'lt2',
    testName: 'Lipid Panel',
    reportImageUrl: 'https://placehold.co/600x800.png', 
    reportDataUri: '',
    dateUploaded: Date.now() - 1000 * 60 * 60 * 24 * 2, 
    notesByLabWorker: 'Elevated LDL cholesterol. Advise lifestyle changes.',
    status: 'analysis_complete',
    dataAiHint: 'lab report'
  },
  {
    id: 'report3',
    patientId: 'user999', // Different patient ID for testing warning
    patientName: 'John Unauthorized',
    testId: 'lt3',
    testName: 'Thyroid Panel',
    reportImageUrl: 'https://placehold.co/600x800.png',
    reportDataUri: '',
    dateUploaded: Date.now() - 1000 * 60 * 60 * 24 * 1,
    notesByLabWorker: 'TSH levels slightly high.',
    status: 'analysis_complete',
    dataAiHint: 'lab report'
  },
];


export default function PatientMedicalRecordsPage() {
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dietPlan, setDietPlan] = useState<string | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleViewReport = (report: LabReport) => {
    if (report.patientId !== MOCK_CURRENT_USER_ID) {
      toast({
        variant: 'destructive',
        title: "Unauthorized Access Attempt",
        description: `You are trying to access '${report.testName}' for patient '${report.patientName || report.patientId}'. This record does not belong to you. This attempt has been logged.`,
      });
      console.warn(
        `ADMIN ALERT: User '${MOCK_CURRENT_USER_ID}' attempted to access unauthorized report ID '${report.id}' belonging to patient '${report.patientId}'. Location: PatientMedicalRecordsPage`
      );
      // Optionally, do not select the report or clear selection
      // setSelectedReport(null); 
      // setUploadedImagePreview(null);
      // setDietPlan(null);
      // return; // Prevent further processing for unauthorized access
    }
    
    setSelectedReport(report);
    setDietPlan(report.dietPlan || null); 
    setUploadedImagePreview(report.reportImageUrl || null); 
    if (report.patientId === MOCK_CURRENT_USER_ID) { // Only toast success if authorized
        toast({ title: "Viewing Report", description: `Details for ${report.testName}` });
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedReport) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setSelectedReport(prev => prev ? { ...prev, reportDataUri: dataUri } : null);
        setUploadedImagePreview(dataUri); 
        toast({ title: "Image Selected", description: "Ready for AI Diet Plan generation."});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetAIDietPlan = async () => {
    if (!selectedReport) {
         toast({ variant: 'destructive', title: 'No Report Selected', description: 'Please select a report first.' });
         return;
    }
    if (selectedReport.patientId !== MOCK_CURRENT_USER_ID) {
        toast({
            variant: 'destructive',
            title: "Unauthorized Action",
            description: `Cannot generate diet plan for a report not belonging to you. This attempt has been logged.`,
        });
        console.warn(
            `ADMIN ALERT: User '${MOCK_CURRENT_USER_ID}' attempted to generate diet plan for unauthorized report ID '${selectedReport.id}' belonging to patient '${selectedReport.patientId}'.`
        );
        return;
    }
    if (!selectedReport.reportDataUri) {
      toast({
        variant: 'destructive',
        title: 'No Report Image',
        description: 'Please upload or ensure an image is associated with this report to analyze for a diet plan.',
      });
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      return;
    }

    setIsAnalyzing(true);
    setDietPlan(null);

    try {
      const result = await aiDietPlanFromReportImage({ reportImageDataUri: selectedReport.reportDataUri });
      setDietPlan(result.dietPlan);
      setSelectedReport(prev => prev ? { ...prev, dietPlan: result.dietPlan, keyFindings: result.keyFindings } : null);
      toast({
        variant: 'success',
        title: 'AI Diet Plan Generated!',
        description: 'Scroll down to view your personalized diet suggestions.',
      });
    } catch (error) {
      console.error("AI Diet Plan error:", error);
      toast({
        variant: 'destructive',
        title: 'AI Analysis Failed',
        description: error instanceof Error ? error.message : 'Could not generate diet plan.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <FileText className="mr-3 h-7 w-7" />
            My Medical Records
          </CardTitle>
          <CardDescription>
            Access your health records, prescriptions, and lab reports securely.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8 border-dashed border-2 border-muted rounded-md">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold text-muted-foreground">General Records Area</h3>
            <p className="text-sm text-muted-foreground">Prescriptions and other documents will appear here.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <FlaskConical className="mr-2 h-6 w-6 text-primary" /> My Lab Reports
          </CardTitle>
          <CardDescription>Select a report to view details or get AI-powered insights. One report is intentionally for a different user to test security warnings.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockLabReports.length > 0 ? (
            <div className="space-y-4">
              {mockLabReports.map((report) => (
                <Card key={report.id} className={`p-4 rounded-md border ${selectedReport?.id === report.id ? 'border-primary shadow-lg ring-2 ring-primary' : 'hover:shadow-md'}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                      <h4 className="font-semibold">{report.testName} (Patient: {report.patientName || report.patientId})</h4>
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {new Date(report.dateUploaded).toLocaleDateString()}
                      </p>
                      {report.notesByLabWorker && <p className="text-sm mt-1 italic text-muted-foreground">Lab Notes: {report.notesByLabWorker}</p>}
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleViewReport(report)} className="rounded-md">
                        <Eye className="mr-2 h-4 w-4" /> Select
                      </Button>
                      <a href={report.reportImageUrl} target="_blank" rel="noopener noreferrer" download={`${report.testName}_Report.jpg`}>
                        <Button variant="outline" size="sm" className="rounded-md">
                          <Download className="mr-2 h-4 w-4" /> Download
                        </Button>
                      </a>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No lab reports found.</p>
          )}
        </CardContent>
      </Card>

      {selectedReport && (
        <Card className="shadow-xl rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gradient">AI Diet Plan for: {selectedReport.testName}</CardTitle>
            <CardDescription>
              Upload an image of your lab report to get AI-powered diet suggestions.
              The better the image quality, the better the analysis. Current report for: Patient {selectedReport.patientName || selectedReport.patientId}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadedImagePreview && (
              <div className="my-4 border rounded-md p-2">
                <p className="text-sm font-medium mb-2">Report Image Preview:</p>
                <Image
                  src={uploadedImagePreview}
                  alt="Lab Report Preview"
                  width={500}
                  height={700}
                  className="rounded-md object-contain max-h-[500px] w-auto mx-auto"
                  data-ai-hint={selectedReport.dataAiHint || "lab report"}
                />
              </div>
            )}
            <div>
              <Label htmlFor="report-image-upload" className="text-sm font-medium">Upload/Change Report Image for AI Analysis</Label>
              <Input 
                id="report-image-upload"
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                ref={fileInputRef} 
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Select an image file (JPG, PNG) of your lab report.</p>
            </div>

            <Button 
              onClick={handleGetAIDietPlan} 
              disabled={isAnalyzing || !selectedReport.reportDataUri}
              className="w-full btn-premium rounded-md"
            >
              {isAnalyzing ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-spin" /> Analyzing Report...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" /> Get AI Diet Plan
                </>
              )}
            </Button>

            {selectedReport.keyFindings && selectedReport.keyFindings.length > 0 && (
              <div className="mt-4 pt-3 border-t">
                <h3 className="text-md font-semibold mb-1 text-primary">Key Findings from AI:</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-0.5">
                  {selectedReport.keyFindings.map((finding, index) => (
                    <li key={index}>{finding}</li>
                  ))}
                </ul>
              </div>
            )}

            {dietPlan && (
              <div className="mt-4 pt-3 border-t">
                <h3 className="text-lg font-semibold mb-2 text-primary">Suggested Diet Plan:</h3>
                <div className="prose prose-sm max-w-none dark:prose-invert 
                  prose-headings:font-semibold prose-headings:text-foreground 
                  prose-p:text-foreground/90
                  prose-ul:list-disc prose-ol:list-decimal prose-li:my-1">
                  <pre className="whitespace-pre-wrap bg-muted p-3 rounded-md text-sm font-mono">{dietPlan}</pre>
                </div>
              </div>
            )}
          </CardContent>
           <CardFooter>
            <p className="text-xs text-muted-foreground">
              Disclaimer: AI-generated diet plans are for informational purposes only and not a substitute for professional medical or nutritional advice. Consult with qualified professionals. Security measures are in place for record access.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

