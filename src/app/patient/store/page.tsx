"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MedicineCard } from '@/components/shared/medicine-card';
import type { Medicine } from '@/types';
import { Search, Pill } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockMedicines: Medicine[] = [
  { id: "1", name: "Paracetamol 500mg Tablets", description: "Relief from fever and pain.", price: 50, rating: 4.5, imageUrl: "https://picsum.photos/seed/med1/300/200", category: "Pain Relief", affiliateLink: "#paracetamol" },
  { id: "2", name: "Vitamin C 1000mg Effervescent", description: "Boosts immunity and antioxidant.", price: 250, rating: 4.8, imageUrl: "https://picsum.photos/seed/med2/300/200", category: "Vitamins", affiliateLink: "#vitaminc" },
  { id: "3", name: "Antacid Syrup", description: "Quick relief from acidity and heartburn.", price: 120, rating: 4.3, imageUrl: "https://picsum.photos/seed/med3/300/200", category: "Digestion", affiliateLink: "#antacid" },
  { id: "4", name: "Cough Syrup", description: "Soothes cough and throat irritation.", price: 90, rating: 4.2, imageUrl: "https://picsum.photos/seed/med4/300/200", category: "Cold & Flu", affiliateLink: "#coughsyrup" },
  { id: "5", name: "Multivitamin Capsules", description: "Daily supplement for overall health.", price: 300, rating: 4.6, imageUrl: "https://picsum.photos/seed/med5/300/200", category: "Vitamins", affiliateLink: "#multivitamin" },
  { id: "6", name: "Ibuprofen Gel", description: "Topical pain relief for muscle aches.", price: 150, rating: 4.4, imageUrl: "https://picsum.photos/seed/med6/300/200", category: "Pain Relief", affiliateLink: "#ibuprofengel" },
];

const categories = ["All", "Popular", "Pain Relief", "Vitamins", "Digestion", "Cold & Flu"];


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

    if (selectedCategory !== 'All' && selectedCategory !== 'Popular') { // 'Popular' could be a curated list
      medicines = medicines.filter(med => med.category === selectedCategory);
    }
    // Add logic for 'Popular' if needed, e.g. sort by rating or specific popular flag

    setFilteredMedicines(medicines);
  }, [searchTerm, selectedCategory]);

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl text-gradient">Medicine Store</CardTitle>
          <CardDescription>Browse and find medicines. Purchases are made through our trusted affiliate partners.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for medicines by name or description..."
              className="pl-10 h-12 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3 sm:flex sm:w-auto">
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="whitespace-nowrap">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* This setup shows all items and filters client-side. For many items, pagination/server-side filtering needed. */}
        <div className="mt-6">
          {filteredMedicines.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMedicines.map((medicine) => (
                <MedicineCard key={medicine.id} medicine={medicine} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12 col-span-full">
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
        Note: All medicine purchases are fulfilled through Amazon. EzCare Connect is an affiliate and may earn from qualifying purchases.
      </p>
    </div>
  );
}
