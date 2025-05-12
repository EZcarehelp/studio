"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { AyurvedicRemedyCard } from '@/components/patient/ayurvedic-remedy-card';
import type { AyurvedicRemedy } from '@/types';
import { Loader2, Search, Sparkles, AlertTriangle, Wand2 } from 'lucide-react';
import { aiAyurvedicRemedy, type AiAyurvedicRemedyInput, type AiAyurvedicRemedyOutput } from '@/ai/flows/ai-ayurvedic-remedy-flow';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import ReactMarkdown from 'react-markdown';

const mockRemedies: AyurvedicRemedy[] = [
  { id: 'remedy1', name: 'Ginger-Honey Tea for Cough', type: 'herbal', tags: ['cough', 'cold', 'throat'], description: 'A soothing tea effective for cough and sore throat.', ingredients: ['1 inch Ginger (grated)', '1 tsp Honey', '1 cup Hot Water', 'Few Tulsi leaves (optional)'], preparation: 'Steep grated ginger and tulsi leaves in hot water for 5-7 minutes. Strain, add honey, and drink warm.', usage: 'Drink 2-3 times a day.', imageUrl: 'https://picsum.photos/seed/ginger_tea/400/300', isFavorite: false },
  { id: 'remedy2', name: 'Turmeric Milk (Golden Milk)', type: 'inflammation', tags: ['immunity', 'anti-inflammatory', 'sleep'], description: 'A traditional drink known for its anti-inflammatory and immune-boosting properties.', ingredients: ['1 cup Milk (dairy or non-dairy)', '1/2 tsp Turmeric powder', '1/4 tsp Black Pepper powder', '1/2 inch Ginger (grated, optional)', 'Sweetener to taste (honey, jaggery)'], preparation: 'Warm the milk, add turmeric, pepper, and ginger. Simmer for 5 minutes. Strain (if using fresh ginger), add sweetener, and drink warm.', usage: 'Drink once daily, preferably before bedtime.', imageUrl: 'https://picsum.photos/seed/turmeric_milk/400/300', isFavorite: true },
  { id: 'remedy3', name: 'Ajwain Water for Digestion', type: 'digestion', tags: ['indigestion', 'gas', 'bloating'], description: 'Helps relieve indigestion, gas, and bloating.', ingredients: ['1 tsp Ajwain (Carom Seeds)', '1 cup Water'], preparation: 'Boil ajwain in water for 5-10 minutes until the water reduces slightly and changes color. Strain and drink warm.', usage: 'Drink after meals or when experiencing digestive discomfort.', imageUrl: 'https://picsum.photos/seed/ajwain_water/400/300', isFavorite: false },
  { id: 'remedy4', name: 'Chamomile Tea for Calmness', type: 'calming', tags: ['stress', 'sleep', 'relax'], description: 'Promotes relaxation and helps improve sleep quality.', ingredients: ['1 Chamomile tea bag or 1 tbsp dried Chamomile flowers', '1 cup Hot Water', 'Honey (optional)'], preparation: 'Steep chamomile in hot water for 5-7 minutes. Add honey if desired.', usage: 'Drink before bedtime or during stressful times.', imageUrl: 'https://picsum.photos/seed/chamomile_tea/400/300', isFavorite: false },
];

const aiRemedySchema = z.object({
  aiQuery: z.string().min(10, { message: "Please describe your ailment or query in at least 10 characters." }).max(300),
});
type AiRemedyFormData = z.infer<typeof aiRemedySchema>;

export default function AyurvedicRemediesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [remedies, setRemedies] = useState<AyurvedicRemedy[]>(mockRemedies);
  const [filteredRemedies, setFilteredRemedies] = useState<AyurvedicRemedy[]>(mockRemedies);
  
  const [aiGeneratedRemedy, setAiGeneratedRemedy] = useState<AyurvedicRemedy | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const aiForm = useForm<AiRemedyFormData>({
    resolver: zodResolver(aiRemedySchema),
    defaultValues: { aiQuery: '' },
  });

  useEffect(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const results = remedies.filter(remedy =>
      remedy.name.toLowerCase().includes(lowerSearchTerm) ||
      remedy.description.toLowerCase().includes(lowerSearchTerm) ||
      remedy.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
    );
    setFilteredRemedies(results);
  }, [searchTerm, remedies]);

  const handleSaveToggle = (remedyId: string) => {
    setRemedies(prevRemedies =>
      prevRemedies.map(r =>
        r.id === remedyId ? { ...r, isFavorite: !r.isFavorite } : r
      )
    );
    if (aiGeneratedRemedy && aiGeneratedRemedy.id === remedyId) {
        setAiGeneratedRemedy(prev => prev ? {...prev, isFavorite: !prev.isFavorite} : null);
    }
  };

  const onAiSubmit: SubmitHandler<AiRemedyFormData> = async (data) => {
    setIsAiLoading(true);
    setAiError(null);
    setAiGeneratedRemedy(null);
    try {
      const inputData: AiAyurvedicRemedyInput = { query: data.aiQuery };
      const result: AiAyurvedicRemedyOutput = await aiAyurvedicRemedy(inputData);
      
      const newRemedy: AyurvedicRemedy = {
        id: `ai-${Date.now()}`,
        name: result.remedyName,
        type: result.type,
        tags: ['ai-generated', data.aiQuery.substring(0,20).toLowerCase().replace(/\s/g, '-')],
        description: result.description,
        ingredients: result.ingredients || [],
        preparation: result.preparation || "Refer to usage notes.",
        usage: result.usage || result.notes || result.disclaimer, // Combine if usage not specific
        isFavorite: false,
        source: "AI Assistant"
      };
      setAiGeneratedRemedy(newRemedy);
    } catch (err) {
      console.error("AI remedy generation error:", err);
      setAiError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };


  return (
    <div className="space-y-10">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-primary/80 via-secondary/80 to-accent/80 p-6">
          <div className="flex items-center space-x-3">
            <Wand2 className="h-10 w-10 text-primary-foreground" />
            <div>
              <CardTitle className="text-3xl font-bold text-primary-foreground">Ask AI for a Remedy</CardTitle>
              <CardDescription className="text-primary-foreground/80 text-sm">
                Can't find what you're looking for? Describe your ailment, and our AI will suggest a traditional remedy.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Form {...aiForm}>
            <form onSubmit={aiForm.handleSubmit(onAiSubmit)} className="space-y-4">
              <FormField
                control={aiForm.control}
                name="aiQuery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="aiQuery" className="text-base font-medium">Your Ailment or Query:</FormLabel>
                    <FormControl>
                      <Textarea
                        id="aiQuery"
                        placeholder="e.g., 'Natural remedy for persistent dry cough' or 'Ayurvedic tips for better sleep'"
                        className="min-h-[100px] text-base rounded-md focus:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full btn-premium rounded-md text-base py-3" disabled={isAiLoading}>
                {isAiLoading ? (
                  <> <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating... </>
                ) : (
                  <> <Sparkles className="mr-2 h-5 w-5" /> Get AI Remedy Suggestion </>
                )}
              </Button>
            </form>
          </Form>

          {aiError && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-md text-destructive">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <p className="font-medium">Error Generating Remedy</p>
              </div>
              <p className="text-sm opacity-90 mt-1">{aiError}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {aiGeneratedRemedy && (
        <div className="my-8">
           <h2 className="text-2xl font-semibold mb-4 text-gradient flex items-center">
            <Sparkles className="mr-2 h-6 w-6" /> AI Suggested Remedy
          </h2>
          <AyurvedicRemedyCard remedy={aiGeneratedRemedy} onSaveToggle={handleSaveToggle} />
           <p className="text-xs text-center text-muted-foreground mt-3">
              {aiGeneratedRemedy.usage?.includes("Consult with a healthcare professional") ? "" : "AI suggestions are for informational purposes. Always consult a healthcare professional for medical advice."}
            </p>
        </div>
      )}


      <div className="space-y-6">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold text-gradient">Ayurvedic Home Remedies</CardTitle>
          <CardDescription>Explore traditional remedies for common ailments. Always consult a healthcare professional for serious conditions.</CardDescription>
        </CardHeader>
        
        <div className="relative">
          <Input
            type="text"
            placeholder="Search remedies by name, ailment, or ingredient..."
            className="pl-10 h-12 text-base rounded-md shadow-sm focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>

        {filteredRemedies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRemedies.map((remedy) => (
              <AyurvedicRemedyCard key={remedy.id} remedy={remedy} onSaveToggle={handleSaveToggle} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12 col-span-full rounded-lg bg-muted/50">
            <CardContent>
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Remedies Found</h3>
              <p className="text-muted-foreground">Try a different search term or ask our AI assistant above!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
