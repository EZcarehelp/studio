
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link'; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { AyurvedicRemedyCard } from '@/components/patient/ayurvedic-remedy-card';
import type { AyurvedicRemedy, RemedyType } from '@/types';
import { Loader2, Search, Sparkles, AlertTriangle, Wand2, ChevronDown, ListFilter, HeartPulse, Apple, Utensils } from 'lucide-react';
import { aiAyurvedicRemedy, type AiAyurvedicRemedyInput, type AiAyurvedicRemedyOutput } from '@/ai/flows/ai-ayurvedic-remedy-flow';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from "@/components/ui/label"; // Added this import

const mockRemedies: AyurvedicRemedy[] = [
  { id: 'remedy1', name: 'Ginger-Honey Tea for Cough', type: 'herbal', tags: ['cough', 'cold', 'throat'], description: 'A soothing tea effective for cough and sore throat.', ingredients: ['1 inch Ginger (grated)', '1 tsp Honey', '1 cup Hot Water', 'Few Tulsi leaves (optional)'], preparation: 'Steep grated ginger and tulsi leaves in hot water for 5-7 minutes. Strain, add honey, and drink warm.', usage: 'Drink 2-3 times a day.', imageUrl: 'https://placehold.co/400x300.png', dataAiHint: "ginger tea", isFavorite: false, views: 120, saves: 25 },
  { id: 'remedy2', name: 'Turmeric Milk (Golden Milk)', type: 'inflammation', tags: ['immunity', 'anti-inflammatory', 'sleep'], description: 'A traditional drink known for its anti-inflammatory and immune-boosting properties.', ingredients: ['1 cup Milk (dairy or non-dairy)', '1/2 tsp Turmeric powder', '1/4 tsp Black Pepper powder', '1/2 inch Ginger (grated, optional)', 'Sweetener to taste (honey, jaggery)'], preparation: 'Warm the milk, add turmeric, pepper, and ginger. Simmer for 5 minutes. Strain (if using fresh ginger), add sweetener, and drink warm.', usage: 'Drink once daily, preferably before bedtime.', imageUrl: 'https://placehold.co/400x300.png', dataAiHint: "turmeric milk", isFavorite: true, views: 250, saves: 60 },
  { id: 'remedy3', name: 'Ajwain Water for Digestion', type: 'digestion', tags: ['indigestion', 'gas', 'bloating'], description: 'Helps relieve indigestion, gas, and bloating.', ingredients: ['1 tsp Ajwain (Carom Seeds)', '1 cup Water'], preparation: 'Boil ajwain in water for 5-10 minutes until the water reduces slightly and changes color. Strain and drink warm.', usage: 'Drink after meals or when experiencing digestive discomfort.', imageUrl: 'https://placehold.co/400x300.png', dataAiHint: "ajwain water", isFavorite: false, views: 90, saves: 15 },
  { id: 'remedy4', name: 'Chamomile Tea for Calmness', type: 'calming', tags: ['stress', 'sleep', 'relax'], description: 'Promotes relaxation and helps improve sleep quality.', ingredients: ['1 Chamomile tea bag or 1 tbsp dried Chamomile flowers', '1 cup Hot Water', 'Honey (optional)'], preparation: 'Steep chamomile in hot water for 5-7 minutes. Add honey if desired.', usage: 'Drink before bedtime or during stressful times.', imageUrl: 'https://placehold.co/400x300.png', dataAiHint: "chamomile tea", isFavorite: false, views: 150, saves: 30 },
];

const remedyTypes: RemedyType[] = ["herbal", "digestion", "inflammation", "calming", "general"];
const allRemedyTypesDisplay = ["All", ...remedyTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1))];

const mockDiseases = ["Cough", "Cold", "Indigestion", "Stress", "Sleep Issues", "Skin Rashes", "Acne"];
const mockIngredients = ["Ginger", "Honey", "Turmeric", "Tulsi", "Ajwain", "Chamomile", "Neem"];


const aiRemedySchema = z.object({
  aiQuery: z.string().min(10, { message: "Please describe your ailment or query in at least 10 characters." }).max(300),
});
type AiRemedyFormData = z.infer<typeof aiRemedySchema>;

export default function AyurvedicRemediesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [remedies, setRemedies] = useState<AyurvedicRemedy[]>(mockRemedies);
  const [filteredRemedies, setFilteredRemedies] = useState<AyurvedicRemedy[]>(mockRemedies);
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>("All");
  
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  
  const [aiGeneratedRemedy, setAiGeneratedRemedy] = useState<AyurvedicRemedy | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const aiForm = useForm<AiRemedyFormData>({
    resolver: zodResolver(aiRemedySchema),
    defaultValues: { aiQuery: '' },
  });

  useEffect(() => {
    let results = [...remedies];
    const lowerSearchTerm = searchTerm.toLowerCase();

    if (lowerSearchTerm) {
        results = results.filter(remedy =>
            remedy.name.toLowerCase().includes(lowerSearchTerm) ||
            remedy.description.toLowerCase().includes(lowerSearchTerm) ||
            (remedy.tags && remedy.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))) ||
            (remedy.ingredients && remedy.ingredients.some(ing => ing.toLowerCase().includes(lowerSearchTerm)))
        );
    }
    
    if (activeTypeFilter !== "All") {
        results = results.filter(remedy => remedy.type.toLowerCase() === activeTypeFilter.toLowerCase());
    }

    if (selectedDiseases.length > 0) {
        results = results.filter(remedy => 
            selectedDiseases.some(disease => 
                (remedy.tags && remedy.tags.some(tag => tag.toLowerCase().includes(disease.toLowerCase()))) || 
                remedy.name.toLowerCase().includes(disease.toLowerCase()) ||
                remedy.description.toLowerCase().includes(disease.toLowerCase())
            )
        );
    }

    if (selectedIngredients.length > 0) {
        results = results.filter(remedy => 
            selectedIngredients.every(selIng => 
                remedy.ingredients && remedy.ingredients.some(rIng => rIng.toLowerCase().includes(selIng.toLowerCase()))
            )
        );
    }

    setFilteredRemedies(results);
  }, [searchTerm, remedies, activeTypeFilter, selectedDiseases, selectedIngredients]);


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
        usage: result.usage || result.notes || result.disclaimer,
        isFavorite: false,
        source: "AI Assistant",
        views: 0,
        saves: 0,
      };
      setAiGeneratedRemedy(newRemedy);
    } catch (err) {
      console.error("AI remedy generation error:", err);
      setAiError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };
  
  const handleDiseaseToggle = (disease: string) => {
    setSelectedDiseases(prev => 
      prev.includes(disease) ? prev.filter(d => d !== disease) : [...prev, disease]
    );
  };

  const handleIngredientToggle = (ingredient: string) => {
    setSelectedIngredients(prev =>
      prev.includes(ingredient) ? prev.filter(i => i !== ingredient) : [...prev, ingredient]
    );
  };
  
  const mostSavedRemedies = [...remedies].sort((a, b) => (b.saves || 0) - (a.saves || 0)).slice(0, 4);


  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="relative w-full max-w-xl mx-auto my-8">
        <Input
          type="search"
          placeholder="Search Remedies (e.g., cough, ginger, immunity...)"
          className="w-full h-12 rounded-full px-6 pl-12 text-base shadow-md focus-visible:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-foreground">Explore Remedies</h1>

      <div className="flex justify-center flex-wrap gap-2 mb-6">
        {allRemedyTypesDisplay.map(type => (
          <Button
            key={type}
            variant={activeTypeFilter === type ? "default" : "outline"}
            onClick={() => setActiveTypeFilter(type)}
            className={cn(
              "rounded-full px-4 py-2 text-sm",
              activeTypeFilter === type ? "bg-primary text-primary-foreground shadow-md" : "bg-card hover:bg-accent"
            )}
          >
            {type}
          </Button>
        ))}
      </div>

      <p className="text-center text-muted-foreground mb-8">
        You have <span className="font-semibold text-primary">{filteredRemedies.length}</span> remedies to explore.
      </p>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content: Remedies Grid */}
        <div className="lg:w-3/4">
          {filteredRemedies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRemedies.map((remedy) => (
                <AyurvedicRemedyCard key={remedy.id} remedy={remedy} onSaveToggle={handleSaveToggle} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12 col-span-full rounded-lg bg-muted/30">
              <CardContent>
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Remedies Found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="lg:w-1/4 space-y-6">
          <Card className="rounded-lg shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center"><HeartPulse className="mr-2 h-5 w-5 text-primary"/>Most Saved</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                {mostSavedRemedies.length > 0 ? mostSavedRemedies.map(remedy => (
                    <Link key={remedy.id} href="#" className="block hover:text-primary text-muted-foreground">
                         <div className="flex items-center space-x-2">
                            <img src={remedy.imageUrl || `https://placehold.co/40x40.png?text=${remedy.name.substring(0,1)}`} alt={remedy.name} className="w-8 h-8 rounded-full object-cover" data-ai-hint="remedy icon"/>
                            <span>{remedy.name}</span>
                        </div>
                    </Link>
                )) : <p className="text-xs text-muted-foreground">No saved remedies yet.</p>}
            </CardContent>
          </Card>
          
          <Card className="rounded-lg shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center"><ListFilter className="mr-2 h-5 w-5 text-primary"/>Filter by Condition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm max-h-60 overflow-y-auto">
              {mockDiseases.map(disease => (
                <div key={disease} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`disease-${disease.replace(/\s+/g, '-')}`} 
                    checked={selectedDiseases.includes(disease)}
                    onCheckedChange={() => handleDiseaseToggle(disease)}
                  />
                  <Label htmlFor={`disease-${disease.replace(/\s+/g, '-')}`} className="font-normal text-muted-foreground">{disease}</Label>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-lg shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center"><Utensils className="mr-2 h-5 w-5 text-primary"/>Filter by Ingredient</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm max-h-60 overflow-y-auto">
              {mockIngredients.map(ingredient => (
                <div key={ingredient} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`ingredient-${ingredient.replace(/\s+/g, '-')}`}
                    checked={selectedIngredients.includes(ingredient)}
                    onCheckedChange={() => handleIngredientToggle(ingredient)}
                  />
                  <Label htmlFor={`ingredient-${ingredient.replace(/\s+/g, '-')}`} className="font-normal text-muted-foreground">{ingredient}</Label>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
      
      {/* AI Chatbot Section (Moved to bottom) */}
      <div className="mt-16 pt-10 border-t">
         <Card className="shadow-xl rounded-lg overflow-hidden max-w-2xl mx-auto">
            <CardHeader className="bg-gradient-to-br from-primary/80 via-primary/70 to-secondary/70 p-6">
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
                        <FormLabel htmlFor="aiQuery" className="text-base font-medium text-foreground">Your Ailment or Query:</FormLabel>
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
            <div className="my-8 max-w-xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-gradient flex items-center justify-center">
                <Sparkles className="mr-2 h-6 w-6" /> AI Suggested Remedy
            </h2>
            <AyurvedicRemedyCard remedy={aiGeneratedRemedy} onSaveToggle={handleSaveToggle} />
            <p className="text-xs text-center text-muted-foreground mt-3">
                {aiGeneratedRemedy.usage?.includes("Consult with a healthcare professional") ? "" : "AI suggestions are for informational purposes. Always consult a healthcare professional for medical advice."}
                </p>
            </div>
        )}
      </div>
    </div>
  );
}

