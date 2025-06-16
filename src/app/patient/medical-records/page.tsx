
"use client";

import { useState, useRef, type ChangeEvent, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Brain, Image as ImageIcon, AlertTriangle, FlaskConical, UploadCloud, Info, MessageSquare, CalendarPlus, ExternalLink, ShieldAlert, HelpCircle } from "lucide-react";
import type { LabReport, AiLabReportAnalysisOutput } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { aiLabReportAnalysis } from '@/ai/flows/ai-lab-report-analysis-flow';
import Image from "next/image";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const MOCK_CURRENT_USER_ID = 'user123';
const MOCK_CURRENT_USERNAME = '@jane_patient'; 

const mockLabReports: LabReport[] = [
  {
    id: 'report1',
    patientId: 'user123',
    patientUsername: '@jane_patient',
    patientName: 'Jane Patient',
    testId: 'lt1',
    testName: 'Complete Blood Count (CBC)',
    reportImageUrl: 'https://placehold.co/600x800.png?text=CBC+Report+Example', 
    reportDataUri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', // Minimal valid data URI
    dateUploaded: Date.now() - 1000 * 60 * 60 * 24 * 5, 
    messageFromLab: 'Standard CBC panel. Results appear within normal ranges. Please discuss with your doctor.',
    status: 'uploaded',
    labName: 'City Central Lab',
    dataAiHint: 'lab report document'
  },
  {
    id: 'report2',
    patientId: 'user123',
    patientUsername: '@jane_patient',
    patientName: 'Jane Patient',
    testId: 'lt2',
    testName: 'Lipid Panel',
    reportImageUrl: 'https://placehold.co/600x800.png?text=Lipid+Panel+Example', 
    reportDataUri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    dateUploaded: Date.now() - 1000 * 60 * 60 * 24 * 2, 
    messageFromLab: 'Noticed slightly elevated LDL cholesterol. Recommend discussing lifestyle and dietary adjustments with your physician.',
    status: 'uploaded',
    labName: 'Wellness Diagnostics',
    dataAiHint: 'medical results'
  },
];


export default function PatientMedicalRecordsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AiLabReportAnalysisOutput | null>(null);
  const [uploadedImagePreviewForAnalysis, setUploadedImagePreviewForAnalysis] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userLabReports = mockLabReports.filter(r => r.patientId === MOCK_CURRENT_USER_ID || r.patientUsername === MOCK_CURRENT_USERNAME);

  const handleSelectReport = (report: LabReport) => {
    setSelectedReport(report);
    setAiAnalysisResult(report.aiAnalysis || null); 
    setUploadedImagePreviewForAnalysis(report.reportDataUri || report.reportImageUrl || null); 
    toast({ title: "Viewing Report", description: `Details for ${report.testName}` });
  };

  const handleFileChangeForAnalysis = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedReport) {
      if (file.size > 10 * 1024 * 1024) { 
        toast({ variant: "destructive", title: "File too large", description: "Please upload an image smaller than 10MB for analysis." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setSelectedReport(prev => prev ? { ...prev, reportDataUri: dataUri, reportImageUrl: dataUri } : null); // Update both for consistency
        setUploadedImagePreviewForAnalysis(dataUri); 
        toast({ title: "Report Image Updated", description: "Ready for AI Analysis."});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetAIAnalysis = async () => {
    if (!selectedReport) {
         toast({ variant: 'destructive', title: 'No Report Selected', description: 'Please select a report first.' });
         return;
    }
    const imageToAnalyze = selectedReport.reportDataUri || selectedReport.reportImageUrl;
    if (!imageToAnalyze) {
      toast({
        variant: 'destructive',
        title: 'No Report Image',
        description: 'Please upload or ensure an image is associated with this report to analyze.',
      });
      fileInputRef.current?.click();
      return;
    }

    setIsAnalyzing(true);
    setAiAnalysisResult(null);

    try {
      const result = await aiLabReportAnalysis({ reportImageDataUri: imageToAnalyze });
      setAiAnalysisResult(result);
      setSelectedReport(prev => prev ? { ...prev, aiAnalysis: result, status: 'analysis_complete' } : null);
      toast({
        variant: 'success',
        title: 'AI Report Analysis Complete!',
        description: 'Scroll down to view the insights.',
      });
    } catch (error) {
      console.error("AI Report Analysis error:", error);
      setSelectedReport(prev => prev ? { ...prev, status: 'analysis_error' } : null);
      toast({
        variant: 'destructive',
        title: 'AI Analysis Failed',
        description: error instanceof Error ? error.message : 'Could not analyze lab report.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleChatAboutReport = () => {
    if (!selectedReport) {
      toast({ variant: 'destructive', title: 'No Report Selected', description: 'Please select a report to chat about.' });
      return;
    }
    const reportContextDataUri = selectedReport.reportDataUri || selectedReport.reportImageUrl || '';
    // Use AI summary if available, otherwise lab message or report name
    const reportContextSummary = selectedReport.aiAnalysis?.medicalSummary || selectedReport.messageFromLab || selectedReport.testName || 'Selected Lab Report';
    const reportName = selectedReport.testName || 'Lab Report';

    router.push(`/ai-symptom-checker?reportContextDataUri=${encodeURIComponent(reportContextDataUri)}&reportContextSummary=${encodeURIComponent(reportContextSummary)}&reportName=${encodeURIComponent(reportName)}`);
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
            Access your health records, prescriptions, and lab reports securely. AI analysis and chat are available for lab reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8 border-dashed border-2 border-muted rounded-md">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold text-muted-foreground">General Records Area</h3>
            <p className="text-sm text-muted-foreground">Prescriptions and other uploaded documents will appear here.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <FlaskConical className="mr-2 h-6 w-6 text-primary" /> My Lab Reports
          </CardTitle>
          <CardDescription>Select a report to view details, get AI-powered insights, or chat with AI about it.</CardDescription>
        </CardHeader>
        <CardContent>
          {userLabReports.length > 0 ? (
            <div className="space-y-4">
              {userLabReports.map((report) => (
                <Card key={report.id} className={`p-4 rounded-md border ${selectedReport?.id === report.id ? 'border-primary shadow-lg ring-2 ring-primary' : 'hover:shadow-md'}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                      <h4 className="font-semibold">{report.testName} 
                        <span className="text-xs text-muted-foreground ml-1">({report.patientName || report.patientUsername})</span>
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        From: {report.labName || 'EzCare Partner Lab'} | Uploaded: {new Date(report.dateUploaded).toLocaleDateString()}
                      </p>
                      {report.messageFromLab && <p className="text-sm mt-1 italic text-muted-foreground">Lab Note: "{report.messageFromLab}"</p>}
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleSelectReport(report)} className="rounded-md">
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </Button>
                       <a href={report.reportImageUrl || '#'} target="_blank" rel="noopener noreferrer" download={`${report.testName}_Report.png`}>
                        <Button variant="outline" size="sm" className="rounded-md" disabled={!report.reportImageUrl}>
                          <Download className="mr-2 h-4 w-4" /> Download
                        </Button>
                      </a>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No lab reports found for your account.</p>
          )}
        </CardContent>
      </Card>

      {selectedReport && (
        <Card className="shadow-xl rounded-lg">
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-xl text-gradient">Selected Report: {selectedReport.testName}</CardTitle>
                    <CardDescription>
                    Patient: {selectedReport.patientName || selectedReport.patientUsername}. Upload an image to analyze, or view existing AI analysis.
                    </CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadedImagePreviewForAnalysis && (
              <div className="my-4 border rounded-md p-2 bg-muted/30">
                <p className="text-sm font-medium mb-2">Report Image Preview:</p>
                <Image
                  src={uploadedImagePreviewForAnalysis}
                  alt="Lab Report Preview"
                  width={500}
                  height={700}
                  className="rounded-md object-contain max-h-[400px] w-auto mx-auto border"
                  data-ai-hint={selectedReport.dataAiHint || "lab report"}
                  unoptimized={uploadedImagePreviewForAnalysis.startsWith('data:')} // Important for data URIs
                />
              </div>
            )}
            <div>
              <Label htmlFor="report-image-upload-analysis" className="text-sm font-medium">Upload/Change Report Image for AI Analysis</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input 
                    id="report-image-upload-analysis"
                    type="file" 
                    accept="image/*,.pdf" 
                    onChange={handleFileChangeForAnalysis}
                    ref={fileInputRef} 
                    className="flex-grow text-sm"
                    aria-label="Upload or change report image for analysis"
                />
                 <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload new image for analysis"
                    aria-label="Trigger file upload for report image"
                >
                    <UploadCloud className="h-4 w-4"/>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Select image (JPG, PNG) or PDF of the lab report.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button 
                onClick={handleGetAIAnalysis} 
                disabled={isAnalyzing || !uploadedImagePreviewForAnalysis}
                className="w-full btn-premium rounded-md"
                aria-live="polite"
              >
                {isAnalyzing ? (
                  <> <Brain className="mr-2 h-4 w-4 animate-spin" /> Analyzing... </>
                ) : aiAnalysisResult ? (
                  <> <Brain className="mr-2 h-4 w-4" /> Re-Analyze Report </>
                ) : (
                  <> <Brain className="mr-2 h-4 w-4" /> Get AI Report Analysis </>
                )}
              </Button>
              <Button 
                onClick={handleChatAboutReport} 
                disabled={!uploadedImagePreviewForAnalysis}
                variant="outline"
                className="w-full rounded-md"
              >
                 <MessageSquare className="mr-2 h-4 w-4" /> Chat with AI about this Report
              </Button>
            </div>


            {aiAnalysisResult && (
              <div className="mt-6 pt-4 border-t space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-primary">AI Medical Summary:</h3>
                  <p className="text-sm text-foreground/90 bg-primary/5 p-3 rounded-md">{aiAnalysisResult.medicalSummary}</p>
                </div>
                
                {aiAnalysisResult.keyParameterAnalyses && aiAnalysisResult.keyParameterAnalyses.length > 0 && (
                  <div>
                    <h3 className="text-md font-semibold mb-1 text-primary">Key Parameter Analyses:</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {aiAnalysisResult.keyParameterAnalyses.map((finding, index) => (
                        <li key={index} className="p-2 border-b last:border-b-0">
                          <strong>{finding.parameter}:</strong> {finding.value} - <span className="italic">{finding.interpretation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiAnalysisResult.actionableSuggestions && aiAnalysisResult.actionableSuggestions.length > 0 && (
                  <div>
                    <h3 className="text-md font-semibold mb-1 text-primary">Actionable Suggestions:</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-0.5 pl-4">
                      {aiAnalysisResult.actionableSuggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {aiAnalysisResult.warningsOrWatchouts && aiAnalysisResult.warningsOrWatchouts.length > 0 && (
                  <div className="p-3 rounded-md border border-destructive/50 bg-destructive/10">
                    <h3 className="text-md font-semibold mb-1 text-destructive flex items-center"><AlertTriangle size={16} className="mr-1.5" /> Warnings / Watch Out For:</h3>
                    <ul className="list-disc list-inside text-sm text-destructive/90 space-y-0.5 pl-4">
                      {aiAnalysisResult.warningsOrWatchouts.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiAnalysisResult.nextStepRecommendation && (
                  <div className="mt-4">
                    <h3 className="text-md font-semibold mb-1 text-primary">Recommended Next Step:</h3>
                    <p className="text-sm text-foreground/90 mb-2">{aiAnalysisResult.nextStepRecommendation}</p>
                    <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/patient/find-doctors">
                                <CalendarPlus className="mr-1.5 h-4 w-4" /> Book Appointment
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleChatAboutReport}>
                             <MessageSquare className="mr-1.5 h-4 w-4" /> Ask EzCare AI
                        </Button>
                    </div>
                  </div>
                )}

                {aiAnalysisResult.potentialFollowUpQuestions && aiAnalysisResult.potentialFollowUpQuestions.length > 0 && (
                  <div className="mt-4 pt-3 border-t">
                    <h3 className="text-md font-semibold mb-1 text-primary flex items-center">
                        <HelpCircle size={18} className="mr-1.5"/> Potential Follow-Up Questions for Your Doctor:
                    </h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-0.5 pl-4 bg-muted/50 p-3 rounded-md">
                      {aiAnalysisResult.potentialFollowUpQuestions.map((question, index) => (
                        <li key={index}>{question}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
           <CardFooter>
             <Card className="mt-4 border-primary/30 bg-primary/10 dark:border-[hsl(var(--accent))]/30 dark:bg-[hsl(var(--accent))]/20 rounded-lg w-full" role="alert">
                <CardHeader className="flex flex-row items-center gap-3 pb-3">
                <ShieldAlert className="h-6 w-6 text-primary dark:text-[hsl(var(--accent))]" />
                <CardTitle className="text-primary dark:text-[hsl(var(--accent))] text-base">Important Note</CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-sm text-primary dark:text-[hsl(var(--accent))]/90">
                    AI-generated analysis is for informational purposes only and not a substitute for professional medical advice. Always consult with qualified healthcare professionals for diagnosis and treatment.
                </p>
                </CardContent>
            </Card>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

