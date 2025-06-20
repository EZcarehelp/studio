
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
import { ScrollArea } from '@/components/ui/scroll-area'; // Added ScrollArea import
import { Badge } from '@/components/ui/badge';

const mockRemedies: AyurvedicRemedy[] = [
  // 🌿 1. Cough (Dry & Wet)
  {
    id: 'remedy001',
    name: 'Tulsi-Kali Mirch Kadha',
    type: 'herbal',
    tags: ['cough', 'tulsi', 'kali mirch', 'ginger', 'kadha'],
    description: 'An effective decoction for cough relief using Tulsi, black peppercorns, and ginger.',
    ingredients: ["10 Tulsi leaves", "5 black peppercorns", "1 tsp ginger (grated)", "2 cups water", "Honey (optional)"],
    preparation: "Boil all ingredients (except honey) in water till reduced to half. Strain and add honey.",
    usage: "Drink warm 2x a day.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "tulsi pepper kadha",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy002',
    name: 'Mulethi Powder Tea',
    type: 'herbal',
    tags: ['dry cough', 'mulethi', 'licorice', 'cinnamon'],
    description: 'A soothing tea made from Mulethi (licorice) powder for dry cough.',
    ingredients: ["1 tsp Mulethi (licorice) powder", "1 cup hot water", "A pinch of cinnamon"],
    preparation: "Stir into hot water, cover for 5 mins, drink warm.",
    usage: "Use for dry cough.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "mulethi licorice tea",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy003',
    name: 'Ginger-Honey Mix',
    type: 'herbal',
    tags: ['sore throat', 'ginger', 'honey', 'cough'],
    description: 'A simple and effective mix of ginger juice and honey for sore throat relief.',
    ingredients: ["1 tsp ginger juice", "1 tsp honey"],
    preparation: "Mix and take 2–3 times a day for sore throat.",
    usage: "Take 2-3 times a day.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "ginger honey",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
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
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "clove honey paste",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy005',
    name: 'Steam Inhalation with Ajwain',
    type: 'herbal',
    tags: ['congestion', 'ajwain', 'carom seeds', 'steam'],
    description: 'Steam inhalation with Ajwain (carom seeds) for relieving nasal congestion.',
    ingredients: ["1 tbsp Ajwain (carom seeds)", "2 cups water"],
    preparation: "Boil water with ajwain and inhale steam for congestion relief.",
    usage: "Inhale steam as needed.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "ajwain steam",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy006',
    name: 'Turmeric Milk',
    type: 'herbal',
    tags: ['cough', 'cold', 'turmeric', 'milk', 'immunity'],
    description: 'Classic turmeric milk (Haldi Doodh) for general wellness and cough/cold relief.',
    ingredients: ["1 cup warm milk", "½ tsp turmeric powder", "A pinch of black pepper"],
    preparation: "Mix and drink before bed.",
    usage: "Drink before bed.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "turmeric milk",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy007',
    name: 'Onion Juice Syrup',
    type: 'herbal',
    tags: ['cough', 'expectorant', 'onion'],
    description: 'A simple syrup made from onion juice and honey, acting as an expectorant.',
    ingredients: ["1 tsp onion juice", "1 tsp honey"],
    preparation: "Mix and take 1–2 times a day.",
    usage: "Take 1-2 times a day.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "onion honey syrup",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  // ❄️ 2. Cold
  {
    id: 'remedy008',
    name: 'Tulsi-Ginger Tea (Cold)',
    type: 'herbal',
    tags: ['cold', 'tulsi', 'ginger', 'tea'],
    description: 'A variation of Tulsi-Ginger tea for cold relief, optionally with black tea.',
    ingredients: ["10 Tulsi leaves", "1 tsp ginger (grated)", "2 cups water", "Honey (optional)", "Pinch of black tea (optional)"],
    preparation: "Same as Remedy 1 (Tulsi-Kali Mirch Kadha), add a pinch of black tea for flavor if desired.",
    usage: "Drink warm 2x a day.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "tulsi ginger tea cold",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy009',
    name: 'Cinnamon-Honey Paste',
    type: 'herbal',
    tags: ['cold', 'cinnamon', 'honey'],
    description: 'A warming paste of cinnamon and honey for cold season.',
    ingredients: ["½ tsp cinnamon powder", "1 tsp honey"],
    preparation: "Mix and take once daily during cold season.",
    usage: "Take once daily.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "cinnamon honey paste",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy010',
    name: 'Garlic Ghee Toast',
    type: 'herbal',
    tags: ['cold', 'runny nose', 'garlic', 'ghee'],
    description: 'Garlic fried in ghee on toast, helpful for runny nose during a cold.',
    ingredients: ["2 garlic cloves", "1 tsp ghee", "Bread"],
    preparation: "Fry garlic in ghee, spread on toast.",
    usage: "Eat during runny nose.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "garlic ghee toast",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy011',
    name: 'Mustard Oil Chest Rub',
    type: 'herbal',
    tags: ['cold', 'chest congestion', 'mustard oil', 'camphor'],
    description: 'A warm mustard oil and camphor rub for chest congestion relief.',
    ingredients: ["2 tbsp mustard oil", "1 tsp camphor"],
    preparation: "Warm slightly, apply on chest and feet before bed.",
    usage: "Apply on chest and feet before bed.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "mustard oil rub",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy012',
    name: 'Ajwain Potli',
    type: 'herbal',
    tags: ['cold', 'chest congestion', 'ajwain'],
    description: 'A heated Ajwain potli (pouch) applied to the chest for warmth and relief.',
    ingredients: ["2 tbsp ajwain", "Cotton cloth"],
    preparation: "Heat ajwain in dry pan, tie in cloth, apply on chest.",
    usage: "Apply on chest as needed.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "ajwain potli",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy013',
    name: 'Camphor Steam',
    type: 'herbal',
    tags: ['nasal congestion', 'camphor', 'steam'],
    description: 'Steam inhalation with camphor for nasal congestion.',
    ingredients: ["2 cups hot water", "A pinch of camphor"],
    preparation: "Inhale for nasal congestion.",
    usage: "Inhale steam as needed.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "camphor steam",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy014',
    name: 'Lemon-Honey Water',
    type: 'herbal',
    tags: ['cold', 'sore throat', 'immunity', 'lemon', 'honey'],
    description: 'Warm lemon-honey water to soothe the throat and boost immunity.',
    ingredients: ["1 glass warm water", "1 tsp lemon juice", "1 tsp honey"],
    preparation: "Drink to soothe throat and boost immunity.",
    usage: "Drink as needed.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "lemon honey water",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  // 🔥 3. Indigestion
  {
    id: 'remedy015',
    name: 'Jeera Water',
    type: 'digestion',
    tags: ['indigestion', 'cumin', 'jeera'],
    description: 'Cumin (Jeera) water to aid digestion.',
    ingredients: ["1 tsp cumin seeds", "2 cups water"],
    preparation: "Boil and cool.",
    usage: "Drink 2–3 times/day.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "jeera water",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy016',
    name: 'Hing-Ajwain Mix',
    type: 'digestion',
    tags: ['indigestion', 'hing', 'asafoetida', 'ajwain'],
    description: 'A mix of Hing (asafoetida) and Ajwain with warm water for post-meal digestion.',
    ingredients: ["½ tsp hing (asafoetida)", "½ tsp ajwain", "Warm water"],
    preparation: "Mix and drink post meal.",
    usage: "Drink post meal.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "hing ajwain mix",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy017',
    name: 'Triphala Powder',
    type: 'digestion',
    tags: ['digestion', 'bowel health', 'constipation', 'triphala'],
    description: 'Triphala powder taken with warm water before bed for digestive health and regular bowel movements.',
    ingredients: ["1 tsp Triphala powder", "Warm water"],
    preparation: "Take before bed for digestion & bowel health.",
    usage: "Take before bed.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "triphala powder",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy018',
    name: 'Ginger-Lemon Shot',
    type: 'digestion',
    tags: ['indigestion', 'appetizer', 'ginger', 'lemon', 'rock salt'],
    description: 'A shot of grated ginger, lemon juice, and rock salt taken before meals to stimulate digestion.',
    ingredients: ["1 tsp grated ginger", "1 tsp lemon juice", "A pinch of rock salt"],
    preparation: "Take before meals.",
    usage: "Take before meals.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "ginger lemon shot",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy019',
    name: 'Buttermilk with Spices',
    type: 'digestion',
    tags: ['indigestion', 'buttermilk', 'jeera', 'black salt'],
    description: 'Spiced buttermilk to drink after meals for better digestion.',
    ingredients: ["1 glass buttermilk", "½ tsp roasted jeera", "A pinch of black salt"],
    preparation: "Mix and drink after meals.",
    usage: "Drink after meals.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "spiced buttermilk",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy020',
    name: 'Fennel Tea',
    type: 'digestion',
    tags: ['bloating', 'gas', 'fennel', 'tea'],
    description: 'Fennel seed tea to help with bloating and gas.',
    ingredients: ["1 tsp fennel seeds", "1 cup hot water"],
    preparation: "Steep for 5 mins.",
    usage: "Helps bloating and gas. Drink as needed.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "fennel tea",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy021',
    name: 'Amla Juice',
    type: 'digestion',
    tags: ['acidity', 'digestion', 'amla', 'gooseberry'],
    description: 'Amla (Indian Gooseberry) juice for acidity and overall digestive health.',
    ingredients: ["2 tsp amla juice", "1 glass water"],
    preparation: "Drink on empty stomach for acidity and digestion.",
    usage: "Drink on empty stomach.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "amla juice",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  // 😖 4. Stress
  {
    id: 'remedy022',
    name: 'Brahmi Tea',
    type: 'calming',
    tags: ['stress', 'brahmi', 'tea', 'calm'],
    description: 'Brahmi tea to help calm the mind and reduce stress.',
    ingredients: ["1 tsp Brahmi powder", "1 cup water", "Honey (optional)"],
    preparation: "Boil powder in water, strain, add honey.",
    usage: "Drink daily.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "brahmi tea",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy023',
    name: 'Ashwagandha Milk',
    type: 'calming',
    tags: ['stress', 'ashwagandha', 'milk', 'adaptogen'],
    description: 'Ashwagandha powder mixed with milk, taken at bedtime for stress relief.',
    ingredients: ["1 tsp Ashwagandha powder", "1 cup milk", "A pinch of cardamom"],
    preparation: "Boil and drink at bedtime.",
    usage: "Drink at bedtime.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "ashwagandha milk",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy024',
    name: 'Tulsi Leaves Chewing',
    type: 'calming',
    tags: ['stress', 'tulsi', 'cortisol', 'calm'],
    description: 'Chewing fresh Tulsi leaves in the morning to calm the mind and reduce cortisol levels.',
    ingredients: ["5 fresh Tulsi leaves"],
    preparation: "Chew daily in morning to calm mind and reduce cortisol.",
    usage: "Chew daily in the morning.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "tulsi leaves",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy025',
    name: 'Shankhpushpi Syrup',
    type: 'calming',
    tags: ['anxiety', 'brain health', 'shankhpushpi', 'syrup'],
    description: 'Shankhpushpi syrup taken for anxiety and promoting brain health.',
    ingredients: ["10 ml Shankhpushpi syrup", "Water"],
    preparation: "Take twice daily for anxiety and brain health.",
    usage: "Take twice daily.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "shankhpushpi syrup",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy026',
    name: 'Lavender Oil Massage',
    type: 'calming',
    tags: ['stress', 'lavender oil', 'massage', 'relaxation'],
    description: 'A calming massage with lavender oil on the neck and head.',
    ingredients: ["5 drops lavender oil", "2 tbsp coconut oil"],
    preparation: "Massage neck and head at night.",
    usage: "Massage neck and head at night.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "lavender oil massage",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy027',
    name: 'Chamomile-Tulsi Tea',
    type: 'calming',
    tags: ['stress', 'chamomile', 'tulsi', 'tea', 'calm'],
    description: 'A soothing tea blend of chamomile and Tulsi.',
    ingredients: ["1 tsp dried chamomile", "3–4 Tulsi leaves", "1 cup hot water"],
    preparation: "Steep and sip.",
    usage: "Sip as needed.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "chamomile tulsi tea",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy028',
    name: 'Pranayama (Breathing + Oil)',
    type: 'calming',
    tags: ['stress', 'pranayama', 'breathing', 'sesame oil', 'nasal drops'],
    description: 'Sesame oil nasal drops followed by deep breathing exercises (Pranayama).',
    ingredients: ["Sesame oil nasal drops (2 drops in each nostril)"],
    preparation: "Use sesame oil nasal drops (2 drops in each nostril) in morning, followed by deep breathing.",
    usage: "Practice in the morning.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "nasal oil drops",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  // 😴 5. Sleep Issues
  {
    id: 'remedy029',
    name: 'Nutmeg Milk',
    type: 'calming',
    tags: ['sleep issues', 'insomnia', 'nutmeg', 'milk'],
    description: 'Warm milk with a pinch of nutmeg taken before bedtime to aid sleep.',
    ingredients: ["A pinch of nutmeg", "1 cup warm milk"],
    preparation: "Drink 30 mins before bedtime.",
    usage: "Drink 30 minutes before bedtime.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "nutmeg milk",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy030',
    name: 'Tagar Powder (Indian Valerian)',
    type: 'calming',
    tags: ['sleep issues', 'tagar', 'valerian', 'insomnia'],
    description: 'Tagar root powder, known as Indian Valerian, for promoting sleep. (Consult practitioner for dose)',
    ingredients: ["500 mg Tagar root powder"],
    preparation: "Take with warm water at bedtime (consult practitioner for dose).",
    usage: "Take with warm water at bedtime.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "tagar powder",
    isFavorite: false, views: 0, saves: 0, source: "Traditional (Consult Practitioner)"
  },
  {
    id: 'remedy031',
    name: 'Warm Ghee in Nostrils',
    type: 'calming',
    tags: ['sleep issues', 'ghee', 'nasya', 'nerves'],
    description: 'Applying warm desi ghee in nostrils before sleep to soothe nerves.',
    ingredients: ["Desi ghee"],
    preparation: "2 drops in each nostril before sleep.",
    usage: "Apply 2 drops in each nostril before sleep.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "ghee nasal drops",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy032',
    name: 'Brahmi Vati',
    type: 'calming',
    tags: ['sleep issues', 'mental calm', 'brahmi vati', 'tablet'],
    description: 'Ayurvedic tablet (Brahmi Vati) for mental calm, taken as prescribed.',
    ingredients: ["Brahmi Vati (Ayurvedic tablet)"],
    preparation: "Take as prescribed.",
    usage: "Take as prescribed by an Ayurvedic practitioner.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "ayurvedic tablets",
    isFavorite: false, views: 0, saves: 0, source: "Ayurvedic Formulation (Consult Practitioner)"
  },
  {
    id: 'remedy033',
    name: 'Banana-Cinnamon Smoothie',
    type: 'calming',
    tags: ['sleep issues', 'banana', 'cinnamon', 'smoothie'],
    description: 'A smoothie made with banana, cinnamon, and warm almond milk before sleep.',
    ingredients: ["1 ripe banana", "1 pinch cinnamon", "Warm almond milk"],
    preparation: "Blend and drink before sleep.",
    usage: "Drink before sleep.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "banana smoothie",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy034',
    name: 'Foot Massage with Sesame Oil',
    type: 'calming',
    tags: ['sleep issues', 'foot massage', 'sesame oil', 'relaxation'],
    description: 'A nightly foot massage with sesame oil for relaxation.',
    ingredients: ["Sesame oil"],
    preparation: "Massage feet for 5 mins nightly.",
    usage: "Massage feet for 5 minutes nightly.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "foot massage oil",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy035',
    name: 'Chamomile-Brahmi Infusion',
    type: 'calming',
    tags: ['sleep issues', 'chamomile', 'brahmi', 'tea', 'infusion'],
    description: 'An infusion of chamomile and Brahmi for promoting restful sleep.',
    ingredients: ["1 tsp dried chamomile", "1 tsp Brahmi powder", "3-4 Tulsi leaves (optional)", "1 cup hot water"],
    preparation: "Steep chamomile and Brahmi (and Tulsi if using) in hot water for 5-7 minutes. Strain and sip.",
    usage: "Drink before bedtime.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "chamomile brahmi tea",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  // 🌺 6. Skin Rashes
  {
    id: 'remedy036',
    name: 'Neem Paste',
    type: 'general', // Could be 'herbal'
    tags: ['skin rashes', 'neem', 'anti-inflammatory', 'anti-bacterial'],
    description: 'A paste of fresh neem leaves applied to skin rashes.',
    ingredients: ["Fresh neem leaves", "Water"],
    preparation: "Grind and apply on rash for 20 mins.",
    usage: "Apply on rash for 20 minutes, then rinse.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "neem paste",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy037',
    name: 'Sandalwood-Rosewater Paste',
    type: 'general',
    tags: ['skin rashes', 'sandalwood', 'rosewater', 'cooling'],
    description: 'A cooling paste of sandalwood powder and rosewater for skin rashes.',
    ingredients: ["1 tbsp sandalwood powder", "Rosewater"],
    preparation: "Make paste, apply on affected area.",
    usage: "Apply on affected area and let dry.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "sandalwood paste",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy038',
    name: 'Aloe Vera Gel',
    type: 'general',
    tags: ['skin rashes', 'aloe vera', 'soothing', 'healing'],
    description: 'Fresh aloe vera gel applied directly to skin rashes for soothing relief.',
    ingredients: ["Fresh aloe vera leaf"],
    preparation: "Extract gel, apply on rash twice daily.",
    usage: "Apply on rash twice daily.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "aloe vera gel",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy039',
    name: 'Turmeric-Curd Pack',
    type: 'general',
    tags: ['skin rashes', 'turmeric', 'curd', 'yogurt', 'anti-inflammatory'],
    description: 'A pack made from turmeric and curd (yogurt) to reduce inflammation of skin rashes.',
    ingredients: ["½ tsp turmeric", "1 tbsp curd"],
    preparation: "Apply for 15 mins. Helps reduce inflammation.",
    usage: "Apply for 15 minutes, then rinse.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "turmeric curd pack",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy040',
    name: 'Coconut Oil + Camphor (Skin)',
    type: 'general',
    tags: ['skin rashes', 'fungal', 'coconut oil', 'camphor'],
    description: 'A mixture of coconut oil and camphor for fungal skin rashes.',
    ingredients: ["2 tbsp coconut oil", "A pinch of camphor"],
    preparation: "Apply for fungal skin rashes.",
    usage: "Apply to affected area.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "coconut oil camphor",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy041',
    name: 'Triphala Water Wash',
    type: 'general',
    tags: ['skin rashes', 'triphala', 'wash', 'detox'],
    description: 'Washing the affected area with Triphala-infused water.',
    ingredients: ["1 tsp Triphala powder", "Water"],
    preparation: "Soak 1 tsp Triphala overnight in water, strain and wash rash area.",
    usage: "Wash rash area with the strained water.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "triphala water",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy042',
    name: 'Khadirarishta',
    type: 'general',
    tags: ['skin detox', 'khadirarishta', 'ayurvedic tonic'],
    description: 'Khadirarishta, an Ayurvedic tonic for skin detoxification (use under guidance).',
    ingredients: ["Khadirarishta (Ayurvedic tonic)"],
    preparation: "Use under guidance.",
    usage: "Take as prescribed by an Ayurvedic practitioner.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "ayurvedic tonic bottle",
    isFavorite: false, views: 0, saves: 0, source: "Ayurvedic Formulation (Consult Practitioner)"
  },
  // 💧 7. Acne
  {
    id: 'remedy043',
    name: 'Multani Mitti + Rosewater',
    type: 'general',
    tags: ['acne', 'multani mitti', 'fullers earth', 'rosewater', 'oil control'],
    description: 'A face pack of Multani Mitti (Fuller\'s Earth) and rosewater for oil control and acne.',
    ingredients: ["2 tbsp Multani mitti", "Rosewater"],
    preparation: "Apply on face for 15 mins. Helps oil control.",
    usage: "Apply on face for 15 minutes, then rinse.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "multani mitti pack",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy044',
    name: 'Neem-Turmeric Face Pack',
    type: 'general',
    tags: ['acne', 'neem', 'turmeric', 'honey', 'face pack'],
    description: 'A face pack with neem, turmeric, and honey for acne.',
    ingredients: ["Neem powder", "Turmeric", "Honey"],
    preparation: "Mix and apply for 15 mins, wash off.",
    usage: "Apply for 15 minutes, then wash off.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "neem turmeric pack",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy045',
    name: 'Aloe Vera + Lemon (Acne)',
    type: 'general',
    tags: ['acne', 'aloe vera', 'lemon', 'brightening'],
    description: 'A mixture of aloe vera gel and lemon juice for acne and skin brightening.',
    ingredients: ["1 tbsp aloe vera gel", "½ tsp lemon juice"],
    preparation: "Apply for 10 mins. Brightens and reduces acne.",
    usage: "Apply for 10 minutes, then rinse.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "aloe lemon mix",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy046',
    name: 'Raw Potato Juice',
    type: 'general',
    tags: ['acne spots', 'potato juice', 'lightening'],
    description: 'Applying raw potato juice to acne spots.',
    ingredients: ["Raw potato"],
    preparation: "Apply potato juice with cotton on acne spots.",
    usage: "Apply juice with cotton on acne spots.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "potato juice acne",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy047',
    name: 'Tulsi-Besan Mask',
    type: 'general',
    tags: ['acne', 'tulsi', 'besan', 'gram flour', 'face mask'],
    description: 'A weekly face mask with Tulsi powder, Besan (gram flour), and rosewater.',
    ingredients: ["1 tsp tulsi powder", "1 tbsp besan", "Rosewater"],
    preparation: "Apply weekly.",
    usage: "Apply weekly for 15-20 minutes, then rinse.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "tulsi besan mask",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy048',
    name: 'Manjistha Powder',
    type: 'general',
    tags: ['acne', 'blood purification', 'manjistha'],
    description: 'Manjistha powder taken internally for blood purification, which can help with acne (under advice).',
    ingredients: ["Manjistha powder"],
    preparation: "Take ½ tsp with warm water daily for blood purification (under advice).",
    usage: "Take ½ tsp with warm water daily.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "manjistha powder herb",
    isFavorite: false, views: 0, saves: 0, source: "Ayurvedic (Consult Practitioner)"
  },
  {
    id: 'remedy049',
    name: 'Apple Cider Vinegar Toner',
    type: 'general',
    tags: ['acne', 'apple cider vinegar', 'toner'],
    description: 'Diluted apple cider vinegar used as a facial toner.',
    ingredients: ["1 part ACV", "3 parts water"],
    preparation: "Use as face toner with cotton.",
    usage: "Use as a toner with a cotton pad after cleansing.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "apple cider vinegar",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  },
  {
    id: 'remedy050',
    name: 'Tea Tree Oil Spot Treatment',
    type: 'general',
    tags: ['acne', 'tea tree oil', 'spot treatment', 'anti-bacterial'],
    description: 'Diluted tea tree oil applied as a spot treatment for acne.',
    ingredients: ["Tea Tree Oil", "Coconut oil (or other carrier oil)"],
    preparation: "Dilute with coconut oil and apply on acne.",
    usage: "Dilute 1-2 drops of tea tree oil with a teaspoon of carrier oil and apply to acne spots.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "tea tree oil bottle",
    isFavorite: false, views: 0, saves: 0, source: "Traditional"
  }
];


const remedyTypes: RemedyType[] = ["herbal", "digestion", "inflammation", "calming", "general"];
const allRemedyTypesDisplay = ["All", ...remedyTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1))];

const mockDiseases = ["Cough", "Cold", "Congestion", "Sore Throat", "Indigestion", "Gas", "Bloating", "Acidity", "Constipation", "Stress", "Anxiety", "Sleep Issues", "Skin Rashes", "Acne", "Fungal Infection"];
const mockIngredients = ["Tulsi", "Ginger", "Honey", "Pepper", "Mulethi", "Cinnamon", "Clove", "Ajwain", "Turmeric", "Onion", "Garlic", "Mustard Oil", "Camphor", "Lemon", "Jeera (Cumin)", "Hing (Asafoetida)", "Triphala", "Buttermilk", "Fennel", "Amla", "Brahmi", "Ashwagandha", "Shankhpushpi", "Lavender Oil", "Sesame Oil", "Nutmeg", "Tagar", "Ghee", "Neem", "Sandalwood", "Aloe Vera", "Curd", "Coconut Oil", "Khadirarishta", "Multani Mitti", "Besan", "Manjistha", "Apple Cider Vinegar", "Tea Tree Oil"];


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
    // Do not set setSelectedRemedyForModal(null) here, 
    // it causes issues if the modal is closed by clicking outside while a save toggle happens inside
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
          else { // If opening, ensure the latest state of the selected remedy is used
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
            <ScrollArea className="flex-grow pr-4 -mr-4"> {/* Added ScrollArea here */}
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
