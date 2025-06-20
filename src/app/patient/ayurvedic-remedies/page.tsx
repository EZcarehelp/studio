
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { AyurvedicRemedyCard } from '@/components/patient/ayurvedic-remedy-card';
import type { AyurvedicRemedy, RemedyType } from '@/types';
import { Loader2, Search, Sparkles, AlertTriangle, Wand2, ChevronDown, ListFilter, HeartPulse, Apple, Utensils, Heart, Eye, Leaf } from 'lucide-react';
import { aiAyurvedicRemedy, type AiAyurvedicRemedyInput, type AiAyurvedicRemedyOutput } from '@/ai/flows/ai-ayurvedic-remedy-flow';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from "@/components/ui/label";
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const mockRemedies: AyurvedicRemedy[] = [
  {
    id: 'remedy001',
    name: 'Vasa and Tulsi for Asthma',
    type: 'herbal',
    tags: ['asthma', 'respiratory', 'vasa', 'tulsi', 'basil'],
    description: 'A traditional decoction to relieve asthma symptoms. It involves boiling Vasa (Adusa/Vasak) water with basil leaves.',
    ingredients: ['250ml Vasa (Adusa) or Vasak water', '10 Basil (Tulsi) leaves'],
    preparation: 'Boil 250ml Vasa water with 10 basil leaves.',
    usage: 'Drink the decoction in the morning. Chanakya Niti recommends drinking it for 21 days for relief.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "herbal decoction",
    isFavorite: false,
    views: 85,
    saves: 12,
    source: "Chanakya Niti"
  },
  {
    id: 'remedy002',
    name: 'Rock Salt for Seasonal Cough',
    type: 'herbal',
    tags: ['cough', 'seasonal cough', 'phlegm', 'rock salt'],
    description: 'A heated rock salt remedy to provide relief from cough, especially phlegm cough.',
    ingredients: ['Rock salt (approx 5 grams)', 'Half a cup of water'],
    preparation: 'Holding about 5 grams of rock salt with tongs, heat it well on fire, on gas or on a griddle. When it starts to turn red, immediately take out the hot nugget by dipping it in half a cup of water.',
    usage: 'Drink the salty hot water in one go. Take at bedtime for two-three days in a row. The same nugget of salt can be kept dry and used again.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "salt remedy",
    isFavorite: true,
    views: 150,
    saves: 30,
    source: "Words of Wisdom – Health Sutras of Ayurveda"
  },
  {
    id: 'remedy003',
    name: 'Licorice Powder for Sore Throat',
    type: 'herbal',
    tags: ['sore throat', 'licorice', 'mulethi', 'swelling'],
    description: 'Licorice powder can be used to cure a sore throat and relieve swelling.',
    ingredients: ['Licorice powder (1 gram)', 'Betel leaf (optional)'],
    preparation: 'Option 1: Put one gram of licorice powder in a betel leaf and eat it. Option 2: Keep one gram of liquorice powder in the mouth.',
    usage: 'Option 1: Eat with betel leaf. Option 2: While sleeping, keep one gram of liquorice powder in the mouth and keep chewing it for some time, then keep it in your mouth overnight. By morning the throat will be clear.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "licorice powder",
    isFavorite: false,
    views: 95,
    saves: 18,
    source: "Traditional Ayurveda"
  },
  {
    id: 'remedy004',
    name: 'Sugar Candy and Fennel for Throat & Mouth',
    type: 'herbal',
    tags: ['throat issues', 'mouth problems', 'dry cough', 'fennel', 'sugar candy'],
    description: 'Fennel and sugar candy are used to cure dry cough, mouth diseases, open the voice, and cure dry throat. It can also sweeten the voice.',
    ingredients: ['Sugar candy (Mishri)', 'Fennel seeds (Saunf - half a teaspoon per dose)'],
    preparation: 'Consume fennel seeds, optionally with sugar candy.',
    usage: 'Take half a teaspoon of fennel after each meal.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "fennel mishri",
    isFavorite: false,
    views: 110,
    saves: 22,
    source: "Yoga practice and therapy"
  },
  {
    id: 'remedy005',
    name: 'Ginger and Jaggery for Cough',
    type: 'herbal',
    tags: ['dry cough', 'sore throat', 'ginger', 'jaggery', 'honey'],
    description: 'A mixture of ground ginger with jaggery or honey, optionally with ghee, to treat dry coughs and sore throats.',
    ingredients: ['Ground ginger', 'Jaggery (Gur) or Honey', 'Ghee (optional, if using jaggery)'],
    preparation: 'Mix ground ginger with jaggery (and optional ghee) or with honey.',
    usage: 'Use as needed to get relief from dry coughs and sore throats.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "ginger jaggery mix",
    isFavorite: true,
    views: 200,
    saves: 45,
    source: "Traditional Home Remedies"
  },
  {
    id: 'remedy006',
    name: 'Ajwain and Black Salt for Stomach Worms',
    type: 'digestion',
    tags: ['stomach worms', 'ajwain', 'carom seeds', 'black salt', 'children'],
    description: 'A remedy using carom seeds (ajwain) powder and black salt to help eliminate stomach worms, with different proportions for children and adults.',
    ingredients: ['Carom seeds (Ajwain) powder', 'Black salt (Kala Namak)', 'Warm water'],
    preparation: 'For children: Mix half a gram of ajwain powder with black salt. For adults: Mix one part black salt with four parts ajwain powder (to make a mixture, then take 2 grams of this mixture).',
    usage: 'Children: Take with warm water. Adults: Take two grams of the adult mixture with warm water before going to bed.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "ajwain black salt",
    isFavorite: false,
    views: 70,
    saves: 10,
    source: "Yoga Darshanam"
  },
  {
    id: 'remedy007',
    name: 'Grape, Myrobalan, and Sugar Chutney for Anorexia',
    type: 'digestion',
    tags: ['anorexia', 'loss of appetite', 'grapes', 'myrobalan', 'haritaki'],
    description: 'A chutney made from grapes, myrobalan, and sugar to help improve appetite.',
    ingredients: ['Grapes (equal quantity)', 'Myrobalan (Haritaki - equal quantity)', 'Sugar (equal quantity)'],
    preparation: 'Make a chutney from equal quantities of grapes, myrobalan, and sugar.',
    usage: 'Lick one small spoon of the chutney twice daily if you don’t feel hungry.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "herbal chutney appetite",
    isFavorite: false,
    views: 60,
    saves: 8,
    source: "Ayurvedic Practices"
  },
  {
    id: 'remedy008',
    name: 'Camphor and Mustard Oil for Body Pain',
    type: 'inflammation',
    tags: ['body pain', 'nerve pain', 'back pain', 'muscle pain', 'camphor', 'mustard oil'],
    description: 'An oil preparation of camphor and mustard oil for relieving various body pains.',
    ingredients: ['Camphor (10 grams)', 'Mustard oil (200 grams)'],
    preparation: 'Fill a vial with 10 grams of camphor and 200 grams mustard oil. Apply a strong compress (seal well) to the vial, and let it dry in the sunlight until the camphor dissolves and mixes well into the oil.',
    usage: 'Apply the oil externally to areas affected by nerve pain, back pain, or muscle pain.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "medicated oil pain",
    isFavorite: false,
    views: 130,
    saves: 25,
    source: "Bharat Ratna to brother Rajiv Dixit"
  },
  {
    id: 'remedy009',
    name: 'Bathua Juice for Joint Pain (Arthritis)',
    type: 'inflammation',
    tags: ['joint pain', 'arthritis', 'bathua', 'chenopodium'],
    description: 'Daily intake of fresh Bathua (Chenopodium album) leaves juice is said to help with arthritis and joint pain.',
    ingredients: ['Fresh Bathua leaves juice (15 grams per dose)'],
    preparation: 'Extract juice from fresh Bathua leaves.',
    usage: 'Take fifteen grams of juice daily. Do not add salt, sugar, etc. Take it every morning on an empty stomach or at four in the evening. Do not take anything two hours before or after taking the juice. Continue for two to three months.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "bathua juice green",
    isFavorite: false,
    views: 90,
    saves: 15,
    source: "Bharat Ratna Rajiv Dixitt"
  },
  {
    id: 'remedy010',
    name: 'Carom Seeds and Whey for Stomach Gas',
    type: 'digestion',
    tags: ['stomach gas', 'flatulence', 'carom seeds', 'ajwain', 'whey', 'curd'],
    description: 'A remedy for stomach gas using carom seeds (ajwain) with curd (yogurt) whey.',
    ingredients: ['Curd with whey (125g)', 'Carom seeds (Ajwain - 2 grams)'],
    preparation: 'Consume together.',
    usage: 'After eating, take 125g curd with whey and two grams carom seeds. For one to two weeks, take after meals as necessary.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "ajwain curd mix",
    isFavorite: false,
    views: 80,
    saves: 11,
    source: "Linguistics Mother Sanskrit Language"
  },
  {
    id: 'remedy011',
    name: 'Oil for Cracked Lips and Dry Eyes',
    type: 'general',
    tags: ['cracked lips', 'dry skin', 'dry eyes', 'mustard oil', 'olive oil', 'navel therapy'],
    description: 'Applying mustard oil or olive oil to the navel daily is believed to prevent chapped lips and soothe dry eyes.',
    ingredients: ['Mustard oil or Olive oil'],
    preparation: 'None needed for the oil itself.',
    usage: 'Apply mustard oil (or olive oil) every day to the navel. This ensures lips don’t crack and chapped lips are softened. Itching and dryness in the eyes may also disappear.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "oil application navel",
    isFavorite: false,
    views: 100,
    saves: 14,
    source: "Traditional Practices"
  },
  {
    id: 'remedy012',
    name: 'Basil Chutney for Cold, Fever, Bronchial Issues',
    type: 'herbal',
    tags: ['cold', 'fever', 'bronchial diseases', 'tulsi', 'basil', 'curd', 'honey'],
    description: 'A chutney made from Tulsi (Holy Basil) leaves, mixed with curd or honey, for treating cold, fever, and chronic bronchial diseases.',
    ingredients: ['21 Tulsi leaves', 'Sweet curd (10-30 grams) or Honey (for children, about half a gram)'],
    preparation: 'Grind 21 Tulsi leaves into a chutney using a silbatta or clean grinder. Mix with 10-30 grams of sweet curd (not sour). If curd isn\'t suitable, honey can be used.',
    usage: 'Eat this mixture every morning on an empty stomach for three months. Small children can be given half a gram of basil chutney with honey. Should not be given with milk. Breakfast can be taken after half an hour.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "tulsi chutney green",
    isFavorite: true,
    views: 170,
    saves: 35,
    source: "Ayurvedic Home Remedies"
  },
  {
    id: 'remedy013',
    name: 'Gulkand and Amla Jam for Anger Management',
    type: 'calming',
    tags: ['anger', 'calming', 'gulkand', 'amla jam', 'gooseberry'],
    description: 'A simple remedy using Gulkand (rose petal jam) and Amla (gooseberry) jam to help calm anger.',
    ingredients: ['Gulkand (1 teaspoon)', 'Amla jam (1 spoon)'],
    preparation: 'No preparation needed as these are typically pre-made items.',
    usage: 'Eat one teaspoon of gulkand each morning and one spoon of gooseberry jam in the evening to calm anger.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "herbal jams gulkand amla",
    isFavorite: false,
    views: 50,
    saves: 5,
    source: "Traditional Wisdom"
  },
  {
    id: 'remedy014',
    name: 'Walnuts for Knee Pain',
    type: 'inflammation',
    tags: ['knee pain', 'joint pain', 'walnuts'],
    description: 'Consuming walnut kernels on an empty stomach is suggested to relieve knee pain.',
    ingredients: ['Walnut kernels (3-4)'],
    preparation: 'None.',
    usage: 'Take three to four walnut kernels in the morning on an empty stomach.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "walnuts healthy",
    isFavorite: false,
    views: 120,
    saves: 20,
    source: "body indigenous mind indigenous"
  },
  {
    id: 'remedy015',
    name: 'Coconut Oil and Lemon Juice for Dark Spots',
    type: 'general',
    tags: ['dark spots', 'skin lightening', 'elbows', 'face', 'coconut oil', 'lemon juice'],
    description: 'A mixture of coconut oil and lemon juice to lighten dark spots on elbows and face.',
    ingredients: ['Lemon juice (from half a lemon)', 'Coconut oil (half a teaspoon)'],
    preparation: 'Mix half a lemon juice with half a teaspoon coconut oil.',
    usage: 'Rub the mixture on the skin and then rinse it off with warm water.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "lemon coconut skin",
    isFavorite: false,
    views: 140,
    saves: 28,
    source: "body indigenous mind indigenous"
  },
  {
    id: 'remedy016',
    name: 'Betel Nut for Cholesterol Control',
    type: 'general',
    tags: ['cholesterol', 'blood pressure', 'betel nut', 'areca nut'],
    description: 'Chewing betel nuts after meals is suggested to act as a blood thinner, potentially helping to decrease cholesterol and blood pressure.',
    ingredients: ['Betel nuts (Supari)'],
    preparation: 'None.',
    usage: 'After eating, chew the betel nuts for 20-40 minutes. Then, clean your mouth. The juice mixed with saliva is believed to be beneficial.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "betel nuts areca",
    isFavorite: false,
    views: 65,
    saves: 7,
    source: "Chanakya Niti’s priceless thoughts"
  },
  {
    id: 'remedy017',
    name: 'Ajwain Oil for Gingivitis',
    type: 'herbal',
    tags: ['gingivitis', 'swollen gums', 'ajwain oil', 'carom seed oil', 'oral health'],
    description: 'Gargling with water mixed with a few drops of ajwain (carom seed) oil can provide relief from swelling gums.',
    ingredients: ['Ajwain oil (few drops)', 'Water'],
    preparation: 'Mix a few drops of ajwain oil in water.',
    usage: 'Gargle with the mixture if you have swelling gums.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "ajwain oil gargle",
    isFavorite: false,
    views: 75,
    saves: 9,
    source: "Vedic Sanskrit Vaidik sanskrit"
  },
  {
    id: 'remedy018',
    name: 'Amla Murabba for Heart Disease',
    type: 'herbal',
    tags: ['heart disease', 'heart weakness', 'abnormal heartbeats', 'amla', 'gooseberry preserve'],
    description: 'Consuming Amla murabba (gooseberry preserve) is considered beneficial for treating heart disease, abnormal heartbeats, and heart weakness.',
    ingredients: ['Amla murabba'],
    preparation: 'Amla murabba is a prepared item.',
    usage: 'Consume Amla murabba three times a day.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "amla murabba preserve",
    isFavorite: true,
    views: 180,
    saves: 40,
    source: "Traditional Ayurvedic Remedies"
  }
];

const remedyTypes: RemedyType[] = ["herbal", "digestion", "inflammation", "calming", "general"];
const allRemedyTypesDisplay = ["All", ...remedyTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1))];

const mockDiseases = ["Cough", "Asthma", "Sore Throat", "Fever", "Digestion", "Gas", "Bloating", "Appetite Loss", "Stomach Worms", "Joint Pain", "Body Pain", "Skin Care", "Dark Spots", "Cracked Lips", "Heart Health", "Cholesterol", "Anger", "Gingivitis", "Oral Health"];
const mockIngredients = ["Ginger", "Honey", "Turmeric", "Tulsi", "Ajwain", "Chamomile", "Neem", "Pepper", "Milk", "Vasa", "Rock Salt", "Licorice", "Fennel", "Jaggery", "Grapes", "Myrobalan", "Camphor", "Mustard Oil", "Bathua", "Curd", "Whey", "Olive Oil", "Gulkand", "Amla", "Walnut", "Coconut Oil", "Lemon", "Betel Nut"];


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

  const [selectedRemedyForModal, setSelectedRemedyForModal] = useState<AyurvedicRemedy | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const aiForm = useForm<AiRemedyFormData>({
    resolver: zodResolver(aiRemedySchema),
    defaultValues: { aiQuery: '' },
  });

  useEffect(() => {
    let results = [...remedies, ...(aiGeneratedRemedy ? [aiGeneratedRemedy] : [])]; 
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
  }, [searchTerm, remedies, activeTypeFilter, selectedDiseases, selectedIngredients, aiGeneratedRemedy]);


  const handleSaveToggle = (remedyId: string) => {
    const updateRemedy = (r: AyurvedicRemedy) => r.id === remedyId ? { ...r, isFavorite: !r.isFavorite, saves: (r.saves || 0) + (r.isFavorite ? -1 : 1) } : r;
    
    setRemedies(prevRemedies => prevRemedies.map(updateRemedy));
    
    if (aiGeneratedRemedy && aiGeneratedRemedy.id === remedyId) {
        setAiGeneratedRemedy(prev => prev ? updateRemedy(prev) : null);
    }
    if (selectedRemedyForModal && selectedRemedyForModal.id === remedyId) {
        setSelectedRemedyForModal(prev => prev ? updateRemedy(prev) : null);
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
        imageUrl: 'https://placehold.co/600x400.png',
        dataAiHint: 'ai generated remedy'
      };
      setAiGeneratedRemedy(newRemedy);
      aiForm.reset();
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
  
  const mostSavedRemedies = [...remedies, ...(aiGeneratedRemedy ? [aiGeneratedRemedy] : [])]
                            .filter(r => r.isFavorite)
                            .sort((a, b) => (b.saves || 0) - (a.saves || 0)) 
                            .slice(0, 4);

  const handleOpenDetailModal = (remedy: AyurvedicRemedy) => {
    // Increment views (mock implementation)
    const updateRemedyViews = (r: AyurvedicRemedy) => r.id === remedy.id ? { ...r, views: (r.views || 0) + 1 } : r;
    setRemedies(prevRemedies => prevRemedies.map(updateRemedyViews));
    if (aiGeneratedRemedy && aiGeneratedRemedy.id === remedy.id) {
        setAiGeneratedRemedy(prev => prev ? updateRemedyViews(prev) : null);
    }
    setSelectedRemedyForModal(prev => prev?.id === remedy.id ? {...remedy, views: (remedy.views || 0) +1 } : {...remedy, views: (remedy.views || 0) +1});
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
  };


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
                <AyurvedicRemedyCard 
                    key={remedy.id} 
                    remedy={remedy} 
                    onSaveToggle={handleSaveToggle}
                    onOpenDetailModal={handleOpenDetailModal} 
                />
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
                    <div key={remedy.id} onClick={() => handleOpenDetailModal(remedy)} className="block hover:text-primary text-muted-foreground cursor-pointer p-1.5 rounded hover:bg-accent/50 transition-colors">
                         <div className="flex items-center space-x-2">
                            <Image src={remedy.imageUrl || `https://placehold.co/40x40.png?text=${remedy.name.substring(0,1)}`} alt={remedy.name} className="w-8 h-8 rounded-full object-cover" width={40} height={40} data-ai-hint={remedy.dataAiHint || "remedy icon"}/>
                            <span className="truncate">{remedy.name}</span>
                        </div>
                    </div>
                )) : <p className="text-xs text-muted-foreground">No saved remedies yet.</p>}
            </CardContent>
          </Card>
          
          <Card className="rounded-lg shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center"><ListFilter className="mr-2 h-5 w-5 text-primary"/>Filter by Condition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm max-h-60 overflow-y-auto">
              {mockDiseases.sort().map(disease => (
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
              {mockIngredients.sort().map(ingredient => (
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
         {aiGeneratedRemedy && !isAiLoading && ( 
            <div className="my-8 max-w-xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-gradient flex items-center justify-center">
                <Sparkles className="mr-2 h-6 w-6" /> AI Suggested Remedy
            </h2>
            <AyurvedicRemedyCard 
                remedy={aiGeneratedRemedy} 
                onSaveToggle={handleSaveToggle}
                onOpenDetailModal={handleOpenDetailModal}
            />
            <p className="text-xs text-center text-muted-foreground mt-3">
                {aiGeneratedRemedy.usage?.includes("Consult with a healthcare professional") ? "" : "AI suggestions are for informational purposes. Always consult a healthcare professional for medical advice."}
                </p>
            </div>
        )}
      </div>

      {/* Remedy Detail Modal */}
      {selectedRemedyForModal && (
        <Dialog open={isDetailModalOpen} onOpenChange={(isOpen) => {
          if (!isOpen) handleCloseDetailModal();
        }}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gradient">{selectedRemedyForModal.name}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                 {selectedRemedyForModal.type.charAt(0).toUpperCase() + selectedRemedyForModal.type.slice(1)} Remedy
                 {selectedRemedyForModal.tags && selectedRemedyForModal.tags.length > 0 && (
                    <div className="mt-1.5">
                        {selectedRemedyForModal.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="mr-1 mb-1 text-xs">{tag}</Badge>
                        ))}
                    </div>
                 )}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-grow pr-4 -mr-4"> 
              <div className="space-y-4 py-4">
                {selectedRemedyForModal.imageUrl && (
                  <div className="relative w-full h-56 md:h-64 rounded-lg overflow-hidden shadow-md">
                    <Image 
                      src={selectedRemedyForModal.imageUrl} 
                      alt={selectedRemedyForModal.name} 
                      fill
                      style={{objectFit: 'cover'}}
                      data-ai-hint={selectedRemedyForModal.dataAiHint || "herbal remedy ingredients"}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                
                <div>
                  <h4 className="font-semibold text-lg mb-1 text-primary">Description</h4>
                  <p className="text-sm text-foreground/90">{selectedRemedyForModal.description}</p>
                </div>

                {selectedRemedyForModal.ingredients && selectedRemedyForModal.ingredients.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-lg mb-1 text-primary">Ingredients</h4>
                    <ul className="list-disc list-inside text-sm text-foreground/90 space-y-0.5 pl-4">
                      {selectedRemedyForModal.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedRemedyForModal.preparation && (
                  <div>
                    <h4 className="font-semibold text-lg mb-1 text-primary">Preparation</h4>
                    <p className="text-sm text-foreground/90 whitespace-pre-line">{selectedRemedyForModal.preparation}</p>
                  </div>
                )}

                {selectedRemedyForModal.usage && (
                  <div>
                    <h4 className="font-semibold text-lg mb-1 text-primary">Usage</h4>
                    <p className="text-sm text-foreground/90 whitespace-pre-line">{selectedRemedyForModal.usage}</p>
                  </div>
                )}
                
                {selectedRemedyForModal.source && (
                  <p className="text-xs text-muted-foreground mt-3 pt-2 border-t">Source: {selectedRemedyForModal.source}</p>
                )}
                 <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-3 pt-2 border-t">
                    <span><Eye className="inline w-3.5 h-3.5 mr-1"/> {selectedRemedyForModal.views || 0} views</span>
                    <span><Heart className="inline w-3.5 h-3.5 mr-1"/> {selectedRemedyForModal.saves || 0} saves</span>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="sm:justify-between items-center pt-4 border-t">
                <Button 
                    variant="ghost" 
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSaveToggle(selectedRemedyForModal.id);
                    }}
                    className="flex items-center"
                    aria-label={selectedRemedyForModal.isFavorite ? "Unsave remedy" : "Save remedy"}
                >
                    <Heart className={cn("w-5 h-5 mr-2", selectedRemedyForModal.isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground hover:text-primary")} />
                    {selectedRemedyForModal.isFavorite ? 'Saved' : 'Save Remedy'}
                </Button>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Close</Button>
                </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}

