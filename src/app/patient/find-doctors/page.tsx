"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DoctorCard } from '@/components/shared/doctor-card';
import type { Doctor } from '@/types';
import { Search, Filter, X, Check } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const mockDoctors: Doctor[] = [
  { id: "1", name: "Dr. Alice Smith", specialty: "Cardiologist", experience: 10, rating: 4.8, consultationFee: 1500, availability: "Available Today", imageUrl: "https://picsum.photos/seed/doc1/400/250", isVerified: true, location: "New York, USA" },
  { id: "2", name: "Dr. Bob Johnson", specialty: "Dermatologist", experience: 7, rating: 4.5, consultationFee: 1200, availability: "Next 3 days", imageUrl: "https://picsum.photos/seed/doc2/400/250", isVerified: true, location: "London, UK" },
  { id: "3", name: "Dr. Carol Williams", specialty: "Pediatrician", experience: 12, rating: 4.9, consultationFee: 1000, availability: "Available Today", imageUrl: "https://picsum.photos/seed/doc3/400/250", isVerified: true, location: "Mumbai, India" },
  { id: "4", name: "Dr. David Brown", specialty: "Orthopedic Surgeon", experience: 15, rating: 4.7, consultationFee: 2000, availability: "Next 3 days", imageUrl: "https://picsum.photos/seed/doc4/400/250", isVerified: false, location: "Toronto, Canada" },
  { id: "5", name: "Dr. Emily Jones", specialty: "Neurologist", experience: 8, rating: 4.6, consultationFee: 1800, availability: "Available Today", imageUrl: "https://picsum.photos/seed/doc5/400/250", isVerified: true, location: "Sydney, Australia" },
  { id: "6", name: "Dr. Frank Davis", specialty: "Cardiologist", experience: 5, rating: 4.3, consultationFee: 1300, availability: "Available Today", imageUrl: "https://picsum.photos/seed/doc6/400/250", isVerified: true, location: "Paris, France" },
];

const specialties = ["Cardiologist", "Dermatologist", "Pediatrician", "Orthopedic Surgeon", "Neurologist", "General Physician"];
const availabilityOptions = ["any", "Available Today", "Next 3 days"];

export default function FindDoctorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>(mockDoctors.filter(doc => doc.isVerified)); // Show only verified by default
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string>("any");

  useEffect(() => {
    let doctors = mockDoctors.filter(doc => doc.isVerified); // Start with verified doctors

    if (searchTerm) {
      doctors = doctors.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSpecialties.length > 0) {
      doctors = doctors.filter(doc => selectedSpecialties.includes(doc.specialty));
    }

    if (selectedAvailability !== "any") {
      doctors = doctors.filter(doc => doc.availability === selectedAvailability);
    }

    setFilteredDoctors(doctors);
  }, [searchTerm, selectedSpecialties, selectedAvailability]);

  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty) ? prev.filter(s => s !== specialty) : [...prev, specialty]
    );
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSpecialties([]);
    setSelectedAvailability("any");
  };


  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl text-gradient">Find Your Doctor</CardTitle>
          <CardDescription>Search for doctors by name, specialty, or symptoms.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="Search by name, specialty..."
                className="pl-10 h-12 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="lg" className="h-12">
                  <Filter className="mr-2 h-5 w-5" /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Doctors</SheetTitle>
                  <SheetDescription>Refine your search based on your preferences.</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Specialty</h4>
                    <div className="space-y-2">
                      {specialties.map(spec => (
                        <div key={spec} className="flex items-center space-x-2">
                          <Checkbox
                            id={`spec-${spec}`}
                            checked={selectedSpecialties.includes(spec)}
                            onCheckedChange={() => handleSpecialtyChange(spec)}
                          />
                          <Label htmlFor={`spec-${spec}`} className="font-normal">{spec}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Availability</h4>
                     <RadioGroup value={selectedAvailability} onValueChange={setSelectedAvailability}>
                      {availabilityOptions.map(opt => (
                        <div key={opt} className="flex items-center space-x-2">
                          <RadioGroupItem value={opt} id={`avail-${opt}`} />
                          <Label htmlFor={`avail-${opt}`} className="font-normal">{opt === "any" ? "Any" : opt}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
                <SheetFooter className="mt-auto">
                  <Button variant="outline" onClick={resetFilters} className="w-full sm:w-auto">
                    <X className="mr-2 h-4 w-4" /> Reset
                  </Button>
                  <SheetClose asChild>
                    <Button type="submit" className="w-full sm:w-auto btn-premium">
                      <Check className="mr-2 h-4 w-4" /> Apply Filters
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
      </Card>

      {filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Doctors Found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            <Button variant="link" onClick={resetFilters} className="mt-4">
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
