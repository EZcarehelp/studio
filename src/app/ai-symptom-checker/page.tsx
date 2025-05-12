"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { aiSymptomAnalysis, type AiSymptomAnalysisInput, type AiSymptomAnalysisOutput } from '@/ai/flows/ai-symptom-analysis';
import { Loader2, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const symptomSchema = z.object({
  symptoms: z.string().min(10, { message: "Please describe your symptoms in at least 10 characters." }).max(2000),
});

type SymptomFormData = z.infer<typeof symptomSchema>;

export default function AiSymptomCheckerPage() {
  const [analysisResult, setAnalysisResult] = useState<AiSymptomAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SymptomFormData>({
    resolver: zodResolver(symptomSchema),
    defaultValues: {
      symptoms: '',
    },
  });

  const onSubmit: SubmitHandler<SymptomFormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const inputData: AiSymptomAnalysisInput = { symptoms: data.symptoms };
      const result = await aiSymptomAnalysis(inputData);
      setAnalysisResult(result);
    } catch (err) {
      console.error("Symptom analysis error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient">AI Symptom Checker</CardTitle>
          <CardDescription>
            Describe your symptoms, and our AI will provide a preliminary analysis.
            This tool is for informational purposes only and does not substitute professional medical advice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="symptoms" className="text-lg">Your Symptoms</FormLabel>
                    <FormControl>
                      <Textarea
                        id="symptoms"
                        placeholder="e.g., I have a persistent cough, mild fever, and headache for the past 3 days..."
                        className="min-h-[150px] text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full btn-premium" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Get Analysis'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {error && (
        <Card className="mt-6 border-destructive bg-destructive/10">
          <CardHeader className="flex flex-row items-center gap-2">
             <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <Card className="mt-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Symptom Analysis Result</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert 
            prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-secondary
            prose-strong:text-foreground prose-ul:list-disc prose-ol:list-decimal">
            <ReactMarkdown
              components={{
                // Open links in new tab
                a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />
              }}
            >{analysisResult.analysis}</ReactMarkdown>
          </CardContent>
           <CardFooter>
            <p className="text-xs text-muted-foreground">
              Disclaimer: This AI analysis is not a medical diagnosis. Always consult with a qualified healthcare professional for any health concerns.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
