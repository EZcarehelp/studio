
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
  // 🌿 1. Cough (Dry & Wet)
  {
    id: 'remedy001',
    name: 'Tulsi-Kali Mirch Kadha',
    type: 'herbal',
    tags: ['cough', 'tulsi', 'kali mirch', 'ginger', 'kadha', 'respiratory'],
    description: 'An effective decoction for cough relief using Tulsi, black peppercorns, and ginger.',
    ingredients: ["10 Tulsi leaves", "5 black peppercorns", "1 tsp ginger (grated)", "2 cups water", "Honey (optional)"],
    preparation: "Boil all ingredients (except honey) in water till reduced to half. Strain and add honey.",
    usage: "Drink warm 2x a day.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "herbal decoction"
  },
  {
    id: 'remedy002',
    name: 'Mulethi Powder Tea',
    type: 'herbal',
    tags: ['dry cough', 'mulethi', 'licorice', 'cinnamon', 'throat'],
    description: 'A soothing tea made from Mulethi (licorice) powder for dry cough.',
    ingredients: ["1 tsp Mulethi (licorice) powder", "1 cup hot water", "A pinch of cinnamon"],
    preparation: "Stir into hot water, cover for 5 mins, drink warm.",
    usage: "Use for dry cough.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "herbal tea"
  },
  {
    id: 'remedy003',
    name: 'Ginger-Honey Mix',
    type: 'herbal',
    tags: ['sore throat', 'ginger', 'honey', 'cough'],
    description: 'A simple and effective mix of ginger juice and honey for sore throat relief.',
    ingredients: ["1 tsp ginger juice", "1 tsp honey"],
    preparation: "Mix well.",
    usage: "Take 2–3 times a day for sore throat.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "natural syrup"
  },
  {
    id: 'remedy004',
    name: 'Clove-Honey Paste',
    type: 'herbal',
    tags: ['cough', 'clove', 'honey'],
    description: 'A paste made from ground cloves and honey for cough relief.',
    ingredients: ["2–3 cloves", "1 tsp honey"],
    preparation: "Grind cloves and mix with honey.",
    usage: "Take once or twice a day.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "spice paste"
  },
  {
    id: 'remedy005',
    name: 'Steam Inhalation with Ajwain',
    type: 'general',
    tags: ['congestion', 'ajwain', 'carom seeds', 'steam', 'respiratory'],
    description: 'Steam inhalation with Ajwain (carom seeds) for relieving nasal congestion.',
    ingredients: ["1 tbsp Ajwain (carom seeds)", "2 cups water"],
    preparation: "Boil water with ajwain.",
    usage: "Inhale steam for congestion relief.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "steam inhalation"
  },
  {
    id: 'remedy006',
    name: 'Turmeric Milk',
    type: 'herbal',
    tags: ['cough', 'cold', 'turmeric', 'milk', 'immunity', 'anti-inflammatory'],
    description: 'Classic turmeric milk (Haldi Doodh) for general wellness and cough/cold relief.',
    ingredients: ["1 cup warm milk", "½ tsp turmeric powder", "A pinch of black pepper"],
    preparation: "Mix all ingredients in warm milk.",
    usage: "Drink before bed.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "golden milk"
  },
  {
    id: 'remedy007',
    name: 'Onion Juice Syrup',
    type: 'herbal',
    tags: ['cough', 'expectorant', 'onion', 'honey'],
    description: 'A simple syrup made from onion juice and honey, acting as an expectorant.',
    ingredients: ["1 tsp onion juice", "1 tsp honey"],
    preparation: "Mix onion juice and honey.",
    usage: "Take 1–2 times a day. Acts as an expectorant.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "homemade syrup"
  },
  // ❄️ 2. Cold
  {
    id: 'remedy008',
    name: 'Tulsi-Ginger Tea (for Cold)',
    type: 'herbal',
    tags: ['cold', 'tulsi', 'ginger', 'tea', 'immunity'],
    description: 'A variation of Tulsi-Ginger tea for cold relief, optionally with black tea.',
    ingredients: ["10 Tulsi leaves", "1 tsp ginger (grated)", "2 cups water", "Honey (optional)", "Pinch of black tea (optional)"],
    preparation: "Boil Tulsi, ginger in water till reduced to half. Strain. Add black tea if desired and honey.",
    usage: "Drink warm 2x a day.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "herbal infusion"
  },
  {
    id: 'remedy009',
    name: 'Cinnamon-Honey Paste (for Cold)',
    type: 'herbal',
    tags: ['cold', 'cinnamon', 'honey', 'warming'],
    description: 'A warming paste of cinnamon and honey for cold season.',
    ingredients: ["½ tsp cinnamon powder", "1 tsp honey"],
    preparation: "Mix cinnamon powder and honey.",
    usage: "Take once daily during cold season.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "sweet paste"
  },
  {
    id: 'remedy010',
    name: 'Garlic Ghee Toast',
    type: 'general',
    tags: ['cold', 'runny nose', 'garlic', 'ghee', 'toast'],
    description: 'Garlic fried in ghee on toast, helpful for runny nose during a cold.',
    ingredients: ["2 garlic cloves", "1 tsp ghee", "Bread"],
    preparation: "Fry garlic in ghee, spread on toast.",
    usage: "Eat during runny nose.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "savory toast"
  },
  {
    id: 'remedy011',
    name: 'Mustard Oil Chest Rub',
    type: 'general',
    tags: ['cold', 'chest congestion', 'mustard oil', 'camphor'],
    description: 'A warm mustard oil and camphor rub for chest congestion relief.',
    ingredients: ["2 tbsp mustard oil", "1 tsp camphor"],
    preparation: "Warm slightly and mix.",
    usage: "Apply on chest and feet before bed.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "herbal rub"
  },
  {
    id: 'remedy012',
    name: 'Ajwain Potli (for Cold)',
    type: 'general',
    tags: ['cold', 'chest congestion', 'ajwain', 'poultice'],
    description: 'A heated Ajwain potli (pouch) applied to the chest for warmth and relief.',
    ingredients: ["2 tbsp ajwain", "Cotton cloth"],
    preparation: "Heat ajwain in dry pan, tie in cloth.",
    usage: "Apply on chest when comfortably warm.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "warm compress"
  },
  {
    id: 'remedy013',
    name: 'Camphor Steam',
    type: 'general',
    tags: ['nasal congestion', 'camphor', 'steam', 'cold'],
    description: 'Steam inhalation with camphor for nasal congestion.',
    ingredients: ["2 cups hot water", "A pinch of camphor"],
    preparation: "Add camphor to hot water.",
    usage: "Inhale steam for nasal congestion.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "vapor inhalation"
  },
  {
    id: 'remedy014',
    name: 'Lemon-Honey Water (for Cold)',
    type: 'herbal',
    tags: ['cold', 'sore throat', 'immunity', 'lemon', 'honey', 'vitamin c'],
    description: 'Warm lemon-honey water to soothe the throat and boost immunity.',
    ingredients: ["1 glass warm water", "1 tsp lemon juice", "1 tsp honey"],
    preparation: "Mix lemon juice and honey in warm water.",
    usage: "Drink to soothe throat and boost immunity.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "citrus drink"
  },
  // 🔥 3. Indigestion
  {
    id: 'remedy015',
    name: 'Jeera Water',
    type: 'digestion',
    tags: ['indigestion', 'cumin', 'jeera', 'bloating'],
    description: 'Cumin (Jeera) water to aid digestion.',
    ingredients: ["1 tsp cumin seeds", "2 cups water"],
    preparation: "Boil cumin seeds in water, then cool.",
    usage: "Drink 2–3 times a day.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "spiced water"
  },
  {
    id: 'remedy016',
    name: 'Hing-Ajwain Mix',
    type: 'digestion',
    tags: ['indigestion', 'hing', 'asafoetida', 'ajwain', 'gas'],
    description: 'A mix of Hing (asafoetida) and Ajwain with warm water for post-meal digestion.',
    ingredients: ["½ tsp hing (asafoetida)", "½ tsp ajwain", "Warm water"],
    preparation: "Mix hing and ajwain with warm water.",
    usage: "Drink post meal.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "digestive aid"
  },
  {
    id: 'remedy017',
    name: 'Triphala Powder',
    type: 'digestion',
    tags: ['digestion', 'bowel health', 'constipation', 'triphala', 'detox'],
    description: 'Triphala powder taken with warm water before bed for digestive health and regular bowel movements.',
    ingredients: ["1 tsp Triphala powder", "Warm water"],
    preparation: "Mix Triphala powder in warm water.",
    usage: "Take before bed for digestion & bowel health.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "herbal powder"
  },
  {
    id: 'remedy018',
    name: 'Ginger-Lemon Shot',
    type: 'digestion',
    tags: ['indigestion', 'appetizer', 'ginger', 'lemon', 'rock salt'],
    description: 'A shot of grated ginger, lemon juice, and rock salt taken before meals to stimulate digestion.',
    ingredients: ["1 tsp grated ginger", "1 tsp lemon juice", "A pinch of rock salt"],
    preparation: "Mix grated ginger, lemon juice, and rock salt.",
    usage: "Take before meals.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "health shot"
  },
  {
    id: 'remedy019',
    name: 'Buttermilk with Spices',
    type: 'digestion',
    tags: ['indigestion', 'buttermilk', 'jeera', 'black salt', 'cooling'],
    description: 'Spiced buttermilk to drink after meals for better digestion.',
    ingredients: ["1 glass buttermilk", "½ tsp roasted jeera powder", "A pinch of black salt"],
    preparation: "Mix roasted jeera powder and black salt into buttermilk.",
    usage: "Drink after meals.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "spiced drink"
  },
  {
    id: 'remedy020',
    name: 'Fennel Tea (for Digestion)',
    type: 'digestion',
    tags: ['bloating', 'gas', 'fennel', 'tea', 'indigestion'],
    description: 'Fennel seed tea to help with bloating and gas.',
    ingredients: ["1 tsp fennel seeds", "1 cup hot water"],
    preparation: "Steep fennel seeds in hot water for 5 mins.",
    usage: "Helps bloating and gas. Drink as needed.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "seed tea"
  },
  {
    id: 'remedy021',
    name: 'Amla Juice (for Digestion)',
    type: 'digestion',
    tags: ['acidity', 'digestion', 'amla', 'gooseberry', 'vitamin c'],
    description: 'Amla (Indian Gooseberry) juice for acidity and overall digestive health.',
    ingredients: ["2 tsp amla juice", "1 glass water"],
    preparation: "Dilute amla juice in water.",
    usage: "Drink on empty stomach for acidity and digestion.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "fruit juice"
  },
  // 😖 4. Stress
  {
    id: 'remedy022',
    name: 'Brahmi Tea',
    type: 'calming',
    tags: ['stress', 'brahmi', 'tea', 'calm', 'mental clarity'],
    description: 'Brahmi tea to help calm the mind and reduce stress.',
    ingredients: ["1 tsp Brahmi powder", "1 cup water", "Honey (optional)"],
    preparation: "Boil Brahmi powder in water, strain, add honey if desired.",
    usage: "Drink daily.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "calming tea"
  },
  {
    id: 'remedy023',
    name: 'Ashwagandha Milk',
    type: 'calming',
    tags: ['stress', 'ashwagandha', 'milk', 'adaptogen', 'sleep'],
    description: 'Ashwagandha powder mixed with milk, taken at bedtime for stress relief.',
    ingredients: ["1 tsp Ashwagandha powder", "1 cup milk", "A pinch of cardamom"],
    preparation: "Boil Ashwagandha powder and cardamom in milk.",
    usage: "Drink at bedtime.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "herbal milk"
  },
  {
    id: 'remedy024',
    name: 'Tulsi Leaves Chewing',
    type: 'calming',
    tags: ['stress', 'tulsi', 'cortisol', 'calm', 'anxiety'],
    description: 'Chewing fresh Tulsi leaves in the morning to calm the mind and reduce cortisol levels.',
    ingredients: ["5 fresh Tulsi leaves"],
    preparation: "None required.",
    usage: "Chew daily in morning to calm mind and reduce cortisol.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "fresh leaves"
  },
  {
    id: 'remedy025',
    name: 'Shankhpushpi Syrup',
    type: 'calming',
    tags: ['anxiety', 'brain health', 'shankhpushpi', 'syrup', 'memory'],
    description: 'Shankhpushpi syrup taken for anxiety and promoting brain health.',
    ingredients: ["10 ml Shankhpushpi syrup", "Water (optional, if too concentrated)"],
    preparation: "Take as per product instructions.",
    usage: "Take twice daily for anxiety and brain health.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "herbal syrup"
  },
  {
    id: 'remedy026',
    name: 'Lavender Oil Massage',
    type: 'calming',
    tags: ['stress', 'lavender oil', 'massage', 'relaxation', 'headache'],
    description: 'A calming massage with lavender oil on the neck and head.',
    ingredients: ["5 drops lavender oil", "2 tbsp coconut oil"],
    preparation: "Mix lavender oil with coconut oil.",
    usage: "Massage neck and head at night.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "aromatherapy oil"
  },
  {
    id: 'remedy027',
    name: 'Chamomile-Tulsi Tea',
    type: 'calming',
    tags: ['stress', 'chamomile', 'tulsi', 'tea', 'calm', 'relaxation'],
    description: 'A soothing tea blend of chamomile and Tulsi.',
    ingredients: ["1 tsp dried chamomile", "3–4 Tulsi leaves", "1 cup hot water"],
    preparation: "Steep chamomile and Tulsi leaves in hot water.",
    usage: "Sip as needed for relaxation.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "flower tea"
  },
  {
    id: 'remedy028',
    name: 'Pranayama (Breathing + Oil)',
    type: 'calming',
    tags: ['stress', 'pranayama', 'breathing', 'sesame oil', 'nasal drops', 'meditation'],
    description: 'Sesame oil nasal drops followed by deep breathing exercises (Pranayama).',
    ingredients: ["Sesame oil nasal drops"],
    preparation: "Administer 2 drops of sesame oil in each nostril.",
    usage: "Use sesame oil nasal drops in morning, followed by deep breathing exercises.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "meditation practice"
  },
  // 😴 5. Sleep Issues
  {
    id: 'remedy029',
    name: 'Nutmeg Milk',
    type: 'calming',
    tags: ['sleep issues', 'insomnia', 'nutmeg', 'milk', 'sedative'],
    description: 'Warm milk with a pinch of nutmeg taken before bedtime to aid sleep.',
    ingredients: ["A pinch of nutmeg powder", "1 cup warm milk"],
    preparation: "Mix nutmeg powder in warm milk.",
    usage: "Drink 30 mins before bedtime.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "spiced milk"
  },
  {
    id: 'remedy030',
    name: 'Tagar Powder (Indian Valerian)',
    type: 'calming',
    tags: ['sleep issues', 'tagar', 'valerian', 'insomnia', 'anxiety'],
    description: 'Tagar root powder, known as Indian Valerian, for promoting sleep. (Consult practitioner for dose)',
    ingredients: ["500 mg Tagar root powder (approx.)", "Warm water"],
    preparation: "Consult practitioner for correct dosage.",
    usage: "Take with warm water at bedtime (consult practitioner for dose).",
    isFavorite: false, views: 0, saves: 0, source: "Traditional (Consult Practitioner)",
    dataAiHint: "root powder"
  },
  {
    id: 'remedy031',
    name: 'Warm Ghee in Nostrils (Nasya)',
    type: 'calming',
    tags: ['sleep issues', 'ghee', 'nasya', 'nerves', 'relaxation'],
    description: 'Applying warm desi ghee in nostrils before sleep to soothe nerves.',
    ingredients: ["Desi ghee (clarified butter)"],
    preparation: "Slightly warm the ghee.",
    usage: "Apply 2 drops in each nostril before sleep. Soothes nerves.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "nasal application"
  },
  {
    id: 'remedy032',
    name: 'Brahmi Vati',
    type: 'calming',
    tags: ['sleep issues', 'mental calm', 'brahmi vati', 'tablet', 'stress'],
    description: 'Ayurvedic tablet (Brahmi Vati) for mental calm, taken as prescribed.',
    ingredients: ["Brahmi Vati (Ayurvedic tablet)"],
    preparation: "No preparation needed.",
    usage: "Take as prescribed by an Ayurvedic practitioner.",
    isFavorite: false, views: 0, saves: 0, source: "Ayurvedic Formulation (Consult Practitioner)",
    dataAiHint: "herbal tablet"
  },
  {
    id: 'remedy033',
    name: 'Banana-Cinnamon Smoothie',
    type: 'calming',
    tags: ['sleep issues', 'banana', 'cinnamon', 'smoothie', 'almond milk'],
    description: 'A smoothie made with banana, cinnamon, and warm almond milk before sleep.',
    ingredients: ["1 ripe banana", "1 pinch cinnamon powder", "Warm almond milk"],
    preparation: "Blend all ingredients until smooth.",
    usage: "Drink before sleep.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "fruit smoothie"
  },
  {
    id: 'remedy034',
    name: 'Foot Massage with Sesame Oil (Sleep)',
    type: 'calming',
    tags: ['sleep issues', 'foot massage', 'sesame oil', 'relaxation'],
    description: 'A nightly foot massage with sesame oil for relaxation.',
    ingredients: ["Sesame oil"],
    preparation: "Warm sesame oil slightly if desired.",
    usage: "Massage feet for 5 mins nightly.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "oil massage"
  },
  {
    id: 'remedy035',
    name: 'Chamomile-Brahmi Infusion',
    type: 'calming',
    tags: ['sleep issues', 'chamomile', 'brahmi', 'tea', 'infusion', 'tulsi'],
    description: 'An infusion of chamomile and Brahmi for promoting restful sleep.',
    ingredients: ["1 tsp dried chamomile", "1 tsp Brahmi powder", "3-4 Tulsi leaves (optional)", "1 cup hot water"],
    preparation: "Steep chamomile and Brahmi (and Tulsi if using) in hot water for 5-7 minutes. Strain and sip.",
    usage: "Drink before bedtime.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "herbal blend"
  },
  // 🌺 6. Skin Rashes
  {
    id: 'remedy036',
    name: 'Neem Paste (for Skin)',
    type: 'general',
    tags: ['skin rashes', 'neem', 'anti-inflammatory', 'anti-bacterial', 'itching'],
    description: 'A paste of fresh neem leaves applied to skin rashes.',
    ingredients: ["Fresh neem leaves", "Water"],
    preparation: "Grind neem leaves with a little water to make a paste.",
    usage: "Apply on rash for 20 mins, then rinse.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "leaf paste"
  },
  {
    id: 'remedy037',
    name: 'Sandalwood-Rosewater Paste',
    type: 'general',
    tags: ['skin rashes', 'sandalwood', 'rosewater', 'cooling', 'soothing'],
    description: 'A cooling paste of sandalwood powder and rosewater for skin rashes.',
    ingredients: ["1 tbsp sandalwood powder", "Rosewater"],
    preparation: "Mix sandalwood powder with rosewater to form a smooth paste.",
    usage: "Apply on affected area and let dry.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "cooling paste"
  },
  {
    id: 'remedy038',
    name: 'Aloe Vera Gel (for Skin)',
    type: 'general',
    tags: ['skin rashes', 'aloe vera', 'soothing', 'healing', 'burns'],
    description: 'Fresh aloe vera gel applied directly to skin rashes for soothing relief.',
    ingredients: ["Fresh aloe vera leaf"],
    preparation: "Extract gel from a fresh aloe vera leaf.",
    usage: "Apply on rash twice daily.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "plant gel"
  },
  {
    id: 'remedy039',
    name: 'Turmeric-Curd Pack (for Skin)',
    type: 'general',
    tags: ['skin rashes', 'turmeric', 'curd', 'yogurt', 'anti-inflammatory'],
    description: 'A pack made from turmeric and curd (yogurt) to reduce inflammation of skin rashes.',
    ingredients: ["½ tsp turmeric powder", "1 tbsp curd (yogurt)"],
    preparation: "Mix turmeric powder and curd to form a paste.",
    usage: "Apply for 15 mins. Helps reduce inflammation.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "skin pack"
  },
  {
    id: 'remedy040',
    name: 'Coconut Oil + Camphor (for Skin)',
    type: 'general',
    tags: ['skin rashes', 'fungal', 'coconut oil', 'camphor', 'itching'],
    description: 'A mixture of coconut oil and camphor for fungal skin rashes.',
    ingredients: ["2 tbsp coconut oil", "A pinch of camphor"],
    preparation: "Mix camphor into coconut oil.",
    usage: "Apply for fungal skin rashes.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "medicated oil"
  },
  {
    id: 'remedy041',
    name: 'Triphala Water Wash (for Skin)',
    type: 'general',
    tags: ['skin rashes', 'triphala', 'wash', 'detox', 'cleansing'],
    description: 'Washing the affected area with Triphala-infused water.',
    ingredients: ["1 tsp Triphala powder", "Water"],
    preparation: "Soak 1 tsp Triphala powder overnight in water, strain.",
    usage: "Wash rash area with the strained water.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "herbal wash"
  },
  {
    id: 'remedy042',
    name: 'Khadirarishta',
    type: 'general',
    tags: ['skin detox', 'khadirarishta', 'ayurvedic tonic', 'blood purifier'],
    description: 'Khadirarishta, an Ayurvedic tonic for skin detoxification (use under guidance).',
    ingredients: ["Khadirarishta (Ayurvedic tonic)"],
    preparation: "No preparation needed.",
    usage: "Use under guidance of an Ayurvedic practitioner.",
    isFavorite: false, views: 0, saves: 0, source: "Ayurvedic Formulation (Consult Practitioner)",
    dataAiHint: "tonic bottle"
  },
  // 💧 7. Acne
  {
    id: 'remedy043',
    name: 'Multani Mitti + Rosewater (for Acne)',
    type: 'general',
    tags: ['acne', 'multani mitti', 'fullers earth', 'rosewater', 'oil control', 'face pack'],
    description: "A face pack of Multani Mitti (Fuller's Earth) and rosewater for oil control and acne.",
    ingredients: ["2 tbsp Multani mitti (Fuller's Earth)", "Rosewater"],
    preparation: "Mix Multani mitti with rosewater to form a paste.",
    usage: "Apply on face for 15 mins. Helps oil control.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "clay mask"
  },
  {
    id: 'remedy044',
    name: 'Neem-Turmeric Face Pack (for Acne)',
    type: 'general',
    tags: ['acne', 'neem', 'turmeric', 'honey', 'face pack', 'anti-bacterial'],
    description: 'A face pack with neem, turmeric, and honey for acne.',
    ingredients: ["Neem powder", "Turmeric powder", "Honey"],
    preparation: "Mix neem powder, turmeric powder, and honey to form a paste.",
    usage: "Apply for 15 mins, wash off.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "herbal mask"
  },
  {
    id: 'remedy045',
    name: 'Aloe Vera + Lemon (for Acne)',
    type: 'general',
    tags: ['acne', 'aloe vera', 'lemon', 'brightening', 'spots'],
    description: 'A mixture of aloe vera gel and lemon juice for acne and skin brightening.',
    ingredients: ["1 tbsp aloe vera gel", "½ tsp lemon juice"],
    preparation: "Mix aloe vera gel and lemon juice.",
    usage: "Apply for 10 mins. Brightens and reduces acne.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "gel mixture"
  },
  {
    id: 'remedy046',
    name: 'Raw Potato Juice (for Acne)',
    type: 'general',
    tags: ['acne spots', 'potato juice', 'lightening', 'blemishes'],
    description: 'Applying raw potato juice to acne spots.',
    ingredients: ["Raw potato"],
    preparation: "Extract juice from a raw potato.",
    usage: "Apply potato juice with cotton on acne spots.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "vegetable juice"
  },
  {
    id: 'remedy047',
    name: 'Tulsi-Besan Mask',
    type: 'general',
    tags: ['acne', 'tulsi', 'besan', 'gram flour', 'face mask', 'cleansing'],
    description: 'A weekly face mask with Tulsi powder, Besan (gram flour), and rosewater.',
    ingredients: ["1 tsp tulsi powder", "1 tbsp besan (gram flour)", "Rosewater"],
    preparation: "Mix tulsi powder, besan, and rosewater to form a paste.",
    usage: "Apply weekly for 15-20 minutes, then rinse.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "powder mask"
  },
  {
    id: 'remedy048',
    name: 'Manjistha Powder (for Acne)',
    type: 'general',
    tags: ['acne', 'blood purification', 'manjistha', 'skin health'],
    description: 'Manjistha powder taken internally for blood purification, which can help with acne (under advice).',
    ingredients: ["Manjistha powder"],
    preparation: "No preparation needed for powder itself.",
    usage: "Take ½ tsp with warm water daily for blood purification (under advice of a practitioner).",
    isFavorite: false, views: 0, saves: 0, source: "Ayurvedic (Consult Practitioner)",
    dataAiHint: "herbal supplement"
  },
  {
    id: 'remedy049',
    name: 'Apple Cider Vinegar Toner',
    type: 'general',
    tags: ['acne', 'apple cider vinegar', 'toner', 'astringent'],
    description: 'Diluted apple cider vinegar used as a facial toner.',
    ingredients: ["1 part Apple Cider Vinegar (ACV)", "3 parts water"],
    preparation: "Dilute ACV with water.",
    usage: "Use as face toner with cotton pad after cleansing.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "liquid toner"
  },
  {
    id: 'remedy050',
    name: 'Tea Tree Oil Spot Treatment',
    type: 'general',
    tags: ['acne', 'tea tree oil', 'spot treatment', 'anti-bacterial'],
    description: 'Diluted tea tree oil applied as a spot treatment for acne.',
    ingredients: ["Tea Tree Oil", "Coconut oil (or other carrier oil)"],
    preparation: "Dilute 1-2 drops of tea tree oil with a teaspoon of carrier oil (like coconut oil).",
    usage: "Apply to acne spots.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "essential oil"
  },
  // Added remedies from user's latest input
  {
    id: 'remedy051',
    name: 'Vasa and Tulsi for Asthma',
    type: 'herbal',
    tags: ['asthma', 'vasa', 'adusa', 'vasak', 'tulsi', 'basil', 'respiratory'],
    description: 'A decoction of Vasa (Adusa) and Tulsi leaves to relieve asthma symptoms.',
    ingredients: ["250ml Vasa (Adusa) or Vasak water", "10 basil (Tulsi) leaves"],
    preparation: "Boil Vasa water with Tulsi leaves until well infused. Strain.",
    usage: "Chanakya Niti recommends drinking it in the morning for 21 days.",
    isFavorite: false, views: 0, saves: 0, source: "Chanakya Niti",
    dataAiHint: "asthma relief"
  },
  {
    id: 'remedy052',
    name: 'Rock Salt for Seasonal Cough',
    type: 'general',
    tags: ['cough', 'seasonal cough', 'phlegm cough', 'rock salt', 'throat'],
    description: 'Heated rock salt dissolved in water to provide relief from cough, especially phlegm cough.',
    ingredients: ["~5 grams rock salt", "Half a cup of water"],
    preparation: "Hold rock salt with tongs and heat it on fire/gas/griddle until it starts to turn red. Immediately dip the hot nugget in half a cup of water.",
    usage: "Drink the salty hot water in one go at bedtime for two-three days. The same salt nugget can be reused if kept dry.",
    isFavorite: false, views: 0, saves: 0, source: "Words of Wisdom – Health Sutras of Ayurveda",
    dataAiHint: "salt water"
  },
  {
    id: 'remedy053',
    name: 'Licorice Powder for Sore Throat',
    type: 'herbal',
    tags: ['sore throat', 'licorice powder', 'mulethi', 'betel leaf', 'swelling', 'voice'],
    description: 'Licorice powder used with betel leaf or chewed directly to cure sore throat and swelling.',
    ingredients: ["Licorice powder", "Betel leaf (optional)"],
    preparation: "Option 1: Put licorice powder in betel leaf and eat. Option 2: While sleeping, keep one gram of licorice powder in the mouth and keep chewing it for some time, then keep it in your mouth and go to sleep.",
    usage: "By morning the throat will be clear. Provides relief in sore throat and swelling.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "throat lozenge"
  },
  {
    id: 'remedy054',
    name: 'Sugar Candy and Fennel for Throat/Mouth Issues',
    type: 'general',
    tags: ['dry cough', 'mouth diseases', 'voice', 'dry throat', 'sugar candy', 'mishri', 'fennel'],
    description: 'Fennel and sugar candy taken after meals to cure dry cough, mouth diseases, open the voice, and cure dry throat.',
    ingredients: ["Half a teaspoon of fennel", "Sugar candy (Mishri)"],
    preparation: "Take half a teaspoon of fennel (optionally with sugar candy) after each meal.",
    usage: "Cures dry cough and mouth diseases, opens the voice, cures dry throat, and makes the voice sweeter.",
    isFavorite: false, views: 0, saves: 0, source: "Yoga practice and therapy",
    dataAiHint: "mouth freshener"
  },
  {
    id: 'remedy055',
    name: 'Ginger and Jaggery for Cough',
    type: 'herbal',
    tags: ['dry cough', 'sore throat', 'ginger', 'jaggery', 'ghee', 'honey'],
    description: 'Ground ginger mixed with jaggery and ghee (or honey) to treat dry coughs and sore throats.',
    ingredients: ["Ground ginger", "Jaggery", "Ghee (or Honey)"],
    preparation: "Mix ground ginger with jaggery and ghee. Honey can be used in place of jaggery or ghee.",
    usage: "Get relief from dry coughs and sore throats.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "sweet remedy"
  },
  {
    id: 'remedy056',
    name: 'Salt and Oregano for Stomach Worms',
    type: 'digestion',
    tags: ['stomach worms', 'carom seeds', 'ajwain', 'black salt', 'parasites'],
    description: 'A mixture of carom seeds (ajwain) powder and black salt with warm water to dissolve stomach worms.',
    ingredients: ["Carom seeds (Ajwain) powder", "Black salt", "Warm water"],
    preparation: "For children: Use half a gram of carom seeds powder mixed with black salt. For elders: Mix one part black salt in four parts carom seed powder. Take two grams.",
    usage: "Take with warm water before going to bed.",
    isFavorite: false, views: 0, saves: 0, source: "Yoga Darshanam",
    dataAiHint: "deworming mix"
  },
  {
    id: 'remedy057',
    name: 'Anorexia Remedy (Grapes & Myrobalan)',
    type: 'digestion',
    tags: ['anorexia', 'loss of appetite', 'grapes', 'myrobalan', 'haritaki', 'sugar', 'appetite stimulant'],
    description: 'A chutney made from grapes, myrobalan (haritaki), and sugar to improve appetite.',
    ingredients: ["Equal quantities of grapes", "Equal quantities of myrobalan (Haritaki)", "Equal quantities of sugar"],
    preparation: "Make a chutney from equal quantities of grapes, myrobalan, and sugar.",
    usage: "Lick one small spoon twice daily if you don’t feel hungry.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "fruit chutney"
  },
  {
    id: 'remedy058',
    name: 'Camphor and Mustard Oil for Body Pain',
    type: 'general',
    tags: ['body pain', 'nerve pain', 'back pain', 'muscle pain', 'camphor', 'mustard oil', 'massage oil'],
    description: 'An oil made from camphor and mustard oil, exposed to sunlight, for treating various body pains.',
    ingredients: ["10 grams of camphor", "200 grams mustard oil"],
    preparation: "Fill a vial with camphor and mustard oil. Apply a strong compress to the vial and let it dry in the sunlight until camphor dissolves.",
    usage: "The oil can be used to treat nerve pain, back pain, and muscle pain by massaging.",
    isFavorite: false, views: 0, saves: 0, source: "Bharat Ratna to brother Rajiv Dixit",
    dataAiHint: "pain relief oil"
  },
  {
    id: 'remedy059',
    name: 'Bathua Juice for Joint Pain',
    type: 'herbal',
    tags: ['joint pain', 'arthritis', 'bathua', 'chenopodium album', 'anti-inflammatory'],
    description: 'Fresh Bathua (Chenopodium album) leaves juice taken daily for arthritis and joint pain.',
    ingredients: ["Fresh Bathua leaves (to yield 15 grams juice)"],
    preparation: "Extract juice from fresh Bathua leaves.",
    usage: "Take fifteen grams of juice daily. Do not add salt, sugar, etc. Take it every morning on an empty stomach or at four in the evening. Do not take anything two hours before or after. Take for two to three months.",
    isFavorite: false, views: 0, saves: 0, source: "Bharat Ratna Rajiv Dixit",
    dataAiHint: "green juice"
  },
  {
    id: 'remedy060',
    name: 'Carom Seeds and Whey for Stomach Gas',
    type: 'digestion',
    tags: ['stomach gas', 'flatulence', 'carom seeds', 'ajwain', 'whey', 'curd', 'bloating'],
    description: 'Curd whey mixed with carom seeds taken after meals to relieve stomach gas.',
    ingredients: ["125g curd (for whey)", "2 grams carom seeds (Ajwain)"],
    preparation: "Extract whey from curd. Mix with carom seeds.",
    usage: "Take after meals as necessary for one to two weeks.",
    isFavorite: false, views: 0, saves: 0, source: "Linguistics Mother Sanskrit Language",
    dataAiHint: "digestive drink"
  },
  {
    id: 'remedy061',
    name: 'Mustard Oil for Cracked Lips/Extremities',
    type: 'general',
    tags: ['cracked lips', 'chapped lips', 'dry eyes', 'mustard oil', 'navel application', 'skin care'],
    description: 'Applying mustard oil to the navel daily to prevent chapped lips and soothe dry eyes.',
    ingredients: ["Mustard oil"],
    preparation: "No preparation needed.",
    usage: "Apply every day to the navel. Ensures lips don’t crack and softens chapped lips. Itching and dryness in the eyes will disappear.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "body oiling"
  },
  {
    id: 'remedy062',
    name: 'Basil for Cold, Fever, Bronchial Diseases',
    type: 'herbal',
    tags: ['cold', 'fever', 'bronchial diseases', 'basil', 'tulsi', 'curd', 'honey', 'respiratory'],
    description: 'A chutney of Tulsi leaves mixed with sweet curd or honey for various respiratory ailments.',
    ingredients: ["21 Tulsi leaves", "Sweet curd (10-30 grams) or Honey"],
    preparation: "Make a chutney with 21 Tulsi leaves (grind with silbatta or clean drywall). Add 10-30 grams of sweet curd. If curd isn’t suitable, honey can be added.",
    usage: "Eat this mixture every morning on an empty stomach for three months. The curd shouldn’t be too sour. Small children can be given half a gram of basil chutney with honey. Do not give with milk. Breakfast can be taken after half an hour.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "herbal paste"
  },
  {
    id: 'remedy063',
    name: 'Gulkand and Amla Jam for Anger',
    type: 'calming',
    tags: ['anger management', 'gulkand', 'rose petal jam', 'amla jam', 'gooseberry jam', 'cooling'],
    description: 'Gulkand and Amla jam taken daily to calm anger.',
    ingredients: ["Gulkand (Rose petal jam)", "Amla jam (Gooseberry jam)"],
    preparation: "No preparation needed.",
    usage: "Take one teaspoon of gulkand each morning and one spoon of gooseberry jam in the evening. Anger will be calmed.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "sweet preserves"
  },
  {
    id: 'remedy064',
    name: 'Walnuts for Knee Pain',
    type: 'general',
    tags: ['knee pain', 'walnuts', 'joint health'],
    description: 'Eating walnut kernels on an empty stomach to relieve knee pain.',
    ingredients: ["3-4 walnut kernels"],
    preparation: "No preparation needed.",
    usage: "Take in the morning on an empty stomach. This will relieve your knee pain.",
    isFavorite: false, views: 0, saves: 0, source: "body indigenous mind indigenous",
    dataAiHint: "nuts remedy"
  },
  {
    id: 'remedy065',
    name: 'Coconut Oil and Lemon Juice for Dark Spots',
    type: 'general',
    tags: ['dark spots', 'elbows', 'face', 'coconut oil', 'lemon juice', 'skin lightening', 'pigmentation'],
    description: 'A mixture of coconut oil and lemon juice to lighten dark spots on elbows and face.',
    ingredients: ["Half a teaspoon coconut oil", "Juice of half a lemon"],
    preparation: "Mix half a lemon juice with half a teaspoon coconut oil.",
    usage: "Rub the mixture on the skin and then rinse it off with warm water.",
    isFavorite: false, views: 0, saves: 0, source: "body indigenous mind indigenous",
    dataAiHint: "skin treatment"
  },
  {
    id: 'remedy066',
    name: 'Betel Nut for Cholesterol Control',
    type: 'general',
    tags: ['cholesterol', 'blood pressure', 'betel nut', 'supari', 'blood thinner', 'heart health'],
    description: 'Chewing betel nuts after meals, as the juice mixed with saliva acts as a blood thinner, potentially helping with cholesterol and blood pressure.',
    ingredients: ["Betel nuts (Supari)"],
    preparation: "No specific preparation, just chew.",
    usage: "After eating, chew the betel nuts for 20-40 minutes. Then, clean your mouth. When mixed with saliva, the juice of betel nuts acts as a blood thinner, causing a decrease in cholesterol and blood pressure.",
    isFavorite: false, views: 0, saves: 0, source: "Chanakya Niti’s priceless thoughts",
    dataAiHint: "areca nut"
  },
  {
    id: 'remedy067',
    name: 'Oregano (Ajwain) for Gingivitis',
    type: 'herbal',
    tags: ['gingivitis', 'swollen gums', 'oregano oil', 'ajwain oil', 'gargle', 'oral health'],
    description: 'Gargling with water mixed with a few drops of ajwain oil (often referred to as oregano in some contexts for its similar properties) for swollen gums.',
    ingredients: ["Ajwain oil (or Oregano oil)", "Water"],
    preparation: "Add a few drops of ajwain oil to water.",
    usage: "Gargle if you have swelling gums. It will provide relief.",
    isFavorite: false, views: 0, saves: 0, source: "Vedic Sanskrit Vaidik sanskrit",
    dataAiHint: "mouthwash"
  },
  {
    id: 'remedy068',
    name: 'Amla For Heart Disease',
    type: 'herbal',
    tags: ['heart disease', 'abnormal heartbeats', 'heart weakness', 'amla', 'gooseberry', 'murabba', 'cardiac health'],
    description: 'Consuming Amla murabba (sweet gooseberry preserve) to treat heart disease, abnormal heartbeats, and heart weakness.',
    ingredients: ["Amla murabba"],
    preparation: "No preparation needed.",
    usage: "Consuming Amla murabba three times a day is a great way to treat heart disease, abnormal heartbeats, and heart weakness.",
    isFavorite: false, views: 0, saves: 0, source: "Traditional",
    dataAiHint: "fruit preserve"
  }
];


const remedyTypes: RemedyType[] = ["herbal", "digestion", "inflammation", "calming", "general"];
const allRemedyTypesDisplay = ["All", ...remedyTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1))];

// Define mockIngredients before mockDiseases
const mockIngredients = Array.from(new Set(mockRemedies.flatMap(r => r.ingredients.map(ing => ing.split(' ')[0].replace(/[^\w\s]/gi, '').toLowerCase())))).filter(i => i.length > 2 && i !== 'tsp' && i !== 'tbsp').sort();
const mockDiseases = Array.from(new Set(mockRemedies.flatMap(r => r.tags.filter(tag => !mockIngredients.includes(tag.toLowerCase()))))).sort();


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
        dataAiHint: "ai suggestion"
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
                            <Leaf className="w-6 h-6 text-green-500 mr-1 shrink-0"/>
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
          else { 
            const currentRemedyState = [...remedies, ...(aiGeneratedRemedy ? [aiGeneratedRemedy] : [])].find(r => r.id === selectedRemedyForModal.id);
            if (currentRemedyState) setSelectedRemedyForModal(currentRemedyState);
          }
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

