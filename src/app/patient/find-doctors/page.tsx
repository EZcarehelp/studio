
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DoctorCard } from '@/components/shared/doctor-card';
import type { Doctor } from '@/types';
import { Search, Filter, X, Check, MapPin, Loader2 } from 'lucide-react';
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
import { getDoctors } from '@/lib/firebase/firestore'; // Import Firebase function

const specialtiesList = ["Cardiologist", "Dermatologist", "Pediatrician", "Orthopedic Surgeon", "Neurologist", "General Physician", "Endocrinologist", "Psychiatrist"];
const availabilityOptions = ["any", "Available Today", "Next 3 days", "Within a week"];

export default function FindDoctorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string>("any");

  useEffect(() => {
    async function fetchDoctorsData() {
      setIsLoading(true);
      try {
        const doctorsFromDB = await getDoctors(); // Fetch from Firebase
        const verifiedDoctors = doctorsFromDB.filter(doc => doc.isVerified);
        setAllDoctors(verifiedDoctors);
        setFilteredDoctors(verifiedDoctors);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
        // Handle error, maybe show a toast to the user
      } finally {
        setIsLoading(false);
      }
    }
    fetchDoctorsData();
  }, []);

  useEffect(() => {
    let doctors = [...allDoctors];

    if (searchTerm) {
      doctors = doctors.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (locationTerm) {
      doctors = doctors.filter(doc => 
        doc.location?.toLowerCase().includes(locationTerm.toLowerCase())
      );
    }

    if (selectedSpecialties.length > 0) {
      doctors = doctors.filter(doc => selectedSpecialties.includes(doc.specialty));
    }

    if (selectedAvailability !== "any") {
      // This part might need adjustment if 'availability' field from Firestore has a different structure/format
      doctors = doctors.filter(doc => doc.availability === selectedAvailability);
    }

    setFilteredDoctors(doctors);
  }, [searchTerm, locationTerm, selectedSpecialties, selectedAvailability, allDoctors]);

  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty) ? prev.filter(s => s !== specialty) : [...prev, specialty]
    );
  };

  const resetFilters = () => {
    setSearchTerm('');
    setLocationTerm('');
    setSelectedSpecialties([]);
    setSelectedAvailability("any");
    setFilteredDoctors(allDoctors.filter(doc => doc.isVerified)); // Reset to all verified doctors
  };


  return (
    <div className="space-y-8">
      <Card className="shadow-md rounded-lg">
        <CardHeader>
          <CardTitle className="text-3xl text-gradient">Find Your Doctor</CardTitle>
          <CardDescription>Search for verified doctors by name, specialty, location, or symptoms.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div className="relative">
              <Label htmlFor="search-term" className="text-sm font-medium">Search by Name/Specialty</Label>
              <Input
                id="search-term"
                type="text"
                placeholder="Dr. Smith, Cardiologist..."
                className="pl-10 h-12 text-base mt-1 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 bottom-3 h-5 w-5 text-muted-foreground" />
            </div>
             <div className="relative">
               <Label htmlFor="location-term" className="text-sm font-medium">Location</Label>
              <Input
                id="location-term"
                type="text"
                placeholder="City, State or Zip Code..."
                className="pl-10 h-12 text-base mt-1 rounded-md"
                value={locationTerm}
                onChange={(e) => setLocationTerm(e.target.value)}
              />
              <MapPin className="absolute left-3 bottom-3 h-5 w-5 text-muted-foreground" />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="lg" className="h-12 sm:col-span-2 lg:col-span-1 lg:w-auto lg:justify-self-start rounded-md">
                  <Filter className="mr-2 h-5 w-5" /> Advanced Filters
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
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {specialtiesList.map(spec => (
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
                  <Button variant="outline" onClick={resetFilters} className="w-full sm:w-auto rounded-md">
                    <X className="mr-2 h-4 w-4" /> Reset All
                  </Button>
                  <SheetClose asChild>
                    <Button type="submit" className="w-full sm:w-auto btn-premium rounded-md">
                      <Check className="mr-2 h-4 w-4" /> Apply Filters
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-3 text-lg text-muted-foreground">Loading doctors...</p>
        </div>
      ) : filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 rounded-lg">
          <CardContent>
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Doctors Found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria, or check back later as new doctors join.</p>
            <Button variant="link" onClick={resetFilters} className="mt-4">
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
