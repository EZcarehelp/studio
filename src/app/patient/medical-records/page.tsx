
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, BarChart, Brain, Image as ImageIcon } from "lucide-react";
import type { LabReport } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { aiDietPlanFromReportImage } from '@/ai/flows/ai-diet-plan-flow'; // Assuming path
import Image from "next/image"; // For displaying report image

// Mock lab reports data
const mockLabReports: LabReport[] = [
  {
    id: 'report1',
    patientId: 'user123',
    patientName: 'Jane Patient',
    testId: 'lt1',
    testName: 'Complete Blood Count (CBC)',
    reportImageUrl: 'https://picsum.photos/seed/report1/600/800', // Placeholder image
    reportDataUri: '', // This would be populated if user uploads for AI
    dateUploaded: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
    notesByLabWorker: 'Standard CBC panel. Results within normal ranges.',
    status: 'analysis_complete',
  },
  {
    id: 'report2',
    patientId: 'user123',
    patientName: 'Jane Patient',
    testId: 'lt2',
    testName: 'Lipid Panel',
    reportImageUrl: 'https://picsum.photos/seed/report2/600/800', // Placeholder image
    reportDataUri: '',
    dateUploaded: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    notesByLabWorker: 'Elevated LDL cholesterol. Advise lifestyle changes.',
    status: 'analysis_complete',
  },
];


export default function PatientMedicalRecordsPage() {
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dietPlan, setDietPlan] = useState<string | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);


  const handleViewReport = (report: LabReport) => {
    setSelectedReport(report);
    setDietPlan(report.dietPlan || null); // Show existing diet plan if any
    setUploadedImagePreview(report.reportImageUrl || null); // Show existing image
    // In a real app, this might open a modal or navigate to a detail page
    toast({ title: "Viewing Report", description: `Details for ${report.testName}` });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedReport) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setSelectedReport(prev => prev ? { ...prev, reportDataUri: dataUri } : null);
        setUploadedImagePreview(dataUri); // Show the newly uploaded image for preview
        toast({ title: "Image Selected", description: "Ready for AI Diet Plan generation."});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetAIDietPlan = async () => {
    if (!selectedReport || !selectedReport.reportDataUri) {
      toast({
        variant: 'destructive',
        title: 'No Report Image',
        description: 'Please upload or select a report image to analyze for a diet plan.',
      });
      // Trigger file input if no data URI
      if (!selectedReport?.reportDataUri && fileInputRef.current) {
        fileInputRef.current.click();
      }
      return;
    }

    setIsAnalyzing(true);
    setDietPlan(null);

    try {
      const result = await aiDietPlanFromReportImage({ reportImageDataUri: selectedReport.reportDataUri });
      setDietPlan(result.dietPlan);
      // Optionally save this dietPlan back to the report object in your backend
      setSelectedReport(prev => prev ? { ...prev, dietPlan: result.dietPlan } : null);
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
          {/* Placeholder for other medical records */}
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
          <CardDescription>View your uploaded lab reports and get AI-powered insights.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockLabReports.length > 0 ? (
            <div className="space-y-4">
              {mockLabReports.map((report) => (
                <Card key={report.id} className={`p-4 rounded-md border ${selectedReport?.id === report.id ? 'border-primary shadow-lg' : 'hover:shadow-md'}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                      <h4 className="font-semibold">{report.testName}</h4>
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {new Date(report.dateUploaded).toLocaleDateString()}
                      </p>
                      {report.notesByLabWorker && <p className="text-sm mt-1 italic text-muted-foreground">Notes: {report.notesByLabWorker}</p>}
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <Button variant="outline" size="sm" onClick={() => handleViewReport(report)}>
                        <Eye className="mr-2 h-4 w-4" /> Select
                      </Button>
                      <a href={report.reportImageUrl} target="_blank" rel="noopener noreferrer" download={`${report.testName}_Report.jpg`}>
                        <Button variant="outline" size="sm">
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
              The better the image quality, the better the analysis.
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
                  data-ai-hint="lab report"
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

            {dietPlan && (
              <div className="mt-6 p-4 border-t">
                <h3 className="text-lg font-semibold mb-2 text-primary">Suggested Diet Plan:</h3>
                <div className="prose prose-sm max-w-none dark:prose-invert 
                  prose-headings:font-semibold prose-headings:text-foreground 
                  prose-p:text-foreground/90
                  prose-ul:list-disc prose-ol:list-decimal prose-li:my-1">
                  <pre className="whitespace-pre-wrap bg-muted p-3 rounded-md text-sm">{dietPlan}</pre>
                </div>
              </div>
            )}
          </CardContent>
           <CardFooter>
            <p className="text-xs text-muted-foreground">
              Disclaimer: AI-generated diet plans are for informational purposes only and not a substitute for professional medical or nutritional advice. Consult with qualified professionals.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
