
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MedicineCard } from '@/components/shared/medicine-card';
import type { Medicine } from '@/types';
import { Search, Pill, ShoppingCart, LocateFixed } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Link from 'next/link';


const mockMedicines: Medicine[] = [
  { id: "1", name: "Paracetamol 500mg Tablets - Strip of 10", description: "Effective relief from fever, headaches, and body pain. Suitable for adults and children over 12.", price: 50, rating: 4.5, imageUrl: "https://placehold.co/300x200.png", dataAiHint: "medicine pills", category: "Pain Relief", affiliateLink: "#paracetamol" },
  { id: "2", name: "Vitamin C 1000mg Effervescent Tablets", description: "Boosts immunity and provides antioxidant support. Orange flavor, 20 tablets.", price: 250, rating: 4.8, imageUrl: "https://placehold.co/300x200.png", dataAiHint: "vitamin tablets", category: "Vitamins", affiliateLink: "#vitaminc" },
  { id: "3", name: "Antacid Syrup - Mint Flavor 200ml", description: "Quick relief from acidity, heartburn, and indigestion. Sugar-free formula.", price: 120, rating: 4.3, imageUrl: "https://placehold.co/300x200.png", dataAiHint: "medicine syrup", category: "Digestion", affiliateLink: "#antacid" },
  { id: "4", name: "Herbal Cough Syrup - Honey & Ginger", description: "Soothes cough and throat irritation naturally. Non-drowsy formula, 100ml bottle.", price: 90, rating: 4.2, imageUrl: "https://placehold.co/300x200.png", dataAiHint: "cough syrup", category: "Cold & Flu", affiliateLink: "#coughsyrup" },
  { id: "5", name: "Multivitamin Capsules - 30 Day Supply", description: "Daily supplement for overall health, energy, and well-being. Contains essential vitamins and minerals.", price: 300, rating: 4.6, imageUrl: "https://placehold.co/300x200.png", dataAiHint: "multivitamin capsules", category: "Vitamins", affiliateLink: "#multivitamin" },
  { id: "6", name: "Ibuprofen Pain Relief Gel - 30g Tube", description: "Topical pain relief for muscle aches, sprains, and joint pain. Fast-acting formula.", price: 150, rating: 4.4, imageUrl: "https://placehold.co/300x200.png", dataAiHint: "pain relief gel", category: "Pain Relief", affiliateLink: "#ibuprofengel" },
];

const categories = ["All", "Popular", "Pain Relief", "Vitamins", "Digestion", "Cold & Flu", "Skin Care", "Baby Care", "Diabetes Care"];


export default function StorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>(mockMedicines);

  useEffect(() => {
    let medicines = mockMedicines;

    if (searchTerm) {
      medicines = medicines.filter(med =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All' && selectedCategory !== 'Popular') { 
      medicines = medicines.filter(med => med.category === selectedCategory);
    } else if (selectedCategory === 'Popular') {
      medicines = [...medicines].sort((a, b) => b.rating - a.rating);
    }
    
    setFilteredMedicines(medicines);
  }, [searchTerm, selectedCategory]);

  return (
    <div className="space-y-8">
      <Card className="shadow-md rounded-lg">
        <CardHeader>
          <CardTitle className="text-3xl text-gradient">Medicine Store</CardTitle>
          <CardDescription>Browse medicines or find them in nearby pharmacies. Purchases are made via affiliate partners.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for medicines by name or description..."
              className="pl-10 h-12 text-base rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
           <Button variant="outline" className="w-full sm:w-auto rounded-md" asChild>
            <Link href="/patient/store/nearby-pharmacies">
              <LocateFixed className="mr-2 h-4 w-4" /> Find Nearby Pharmacies
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <TabsList className="inline-flex h-auto p-1">
            {categories.map(category => (
              <TabsTrigger 
                key={category} 
                value={category} 
                className={`data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:border data-[state=inactive]:border-input data-[state=inactive]:hover:bg-accent data-[state=inactive]:hover:text-accent-foreground whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium`}
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        
        <div className="mt-6">
          {filteredMedicines.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMedicines.map((medicine) => (
                <MedicineCard key={medicine.id} medicine={medicine} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12 col-span-full rounded-lg">
              <CardContent>
                <Pill className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Medicines Found</h3>
                <p className="text-muted-foreground">Try adjusting your search or category.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </Tabs>
       <p className="text-sm text-muted-foreground text-center mt-8">
        Note: All medicine purchases are fulfilled through external affiliate partners. EzCare Connect may earn from qualifying purchases. Prices and availability are subject to change on the partner's site. Check nearby pharmacies for local availability.
      </p>
    </div>
  );
}
