
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { FlaskConical, CalendarPlus, Star, MapPin } from "lucide-react"; // Added Star, MapPin
import { useToast } from "@/hooks/use-toast";
import type { LabTest } from "@/types";
import Image from "next/image"; // Added Image
import { Badge } from "@/components/ui/badge"; // Added Badge

// Mock lab tests - updated with new fields
const mockLabTests: LabTest[] = [
  { 
    id: 'lt1', 
    name: 'Complete Blood Count (CBC)', 
    description: 'Measures different components of your blood, such as red and white blood cells, platelets, and hemoglobin.', 
    price: 500,
    labName: "City Health Diagnostics",
    location: "123 Main St, Cityville",
    rating: 4.5,
    dataAiHint: "lab building"
  },
  { 
    id: 'lt2', 
    name: 'Lipid Panel (Cholesterol Test)', 
    description: 'Measures fats and fatty substances used as a source of energy by your body, including cholesterol and triglycerides.', 
    price: 750,
    labName: "Apollo Labs Downtown",
    location: "456 Oak Ave, Cityville",
    rating: 4.8,
    dataAiHint: "modern laboratory"
  },
  { 
    id: 'lt3', 
    name: 'Basic Metabolic Panel (BMP)', 
    description: 'Measures glucose, sodium, potassium, calcium, chloride, carbon dioxide, blood urea nitrogen (BUN), and creatinine.', 
    price: 600,
    labName: "Wellness Labs Inc.",
    location: "789 Pine Rd, Suburbia",
    rating: 4.2,
    dataAiHint: "lab equipment"
  },
  { 
    id: 'lt4', 
    name: 'Urinalysis', 
    description: 'Checks for various compounds that pass through your urine, helping detect kidney diseases, diabetes, and urinary tract infections.', 
    price: 300,
    labName: "QuickTest Labs",
    location: "101 Elm St, Cityville",
    rating: 4.0,
    dataAiHint: "medical testing"
  },
  { 
    id: 'lt5', 
    name: 'Thyroid Stimulating Hormone (TSH) Test', 
    description: 'Measures the level of TSH in your blood, which can indicate thyroid problems.', 
    price: 450,
    labName: "City Health Diagnostics",
    location: "123 Main St, Cityville",
    rating: 4.5,
    dataAiHint: "health screening"
  },
];


export default function PatientLabTestsPage() {
  const { toast } = useToast();

  const handleBookTest = (testName: string, labName?: string) => {
    toast({
      title: "Test Booking Requested",
      description: `Your request to book "${testName}" ${labName ? `at ${labName}` : ''} has been sent. A lab representative will contact you shortly.`,
      variant: "success",
    });
    console.log(`Booking request for ${testName} ${labName ? `at ${labName}` : ''}`);
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <FlaskConical className="mr-3 h-7 w-7" />
            Book Lab Tests
          </CardTitle>
          <CardDescription>
            Browse available lab tests from our partner labs. Request a booking for home sample collection or a center visit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mockLabTests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockLabTests.map((test) => (
                <Card key={test.id} className="flex flex-col card-gradient rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  {/* Optional Image for Lab */}
                  {test.labName && ( // Assuming labs might have images, placeholder for now
                    <div className="relative w-full h-32 bg-muted">
                      <Image 
                        src={`https://placehold.co/400x200.png?text=${encodeURIComponent(test.labName)}`}
                        alt={test.labName || "Lab Image"}
                        fill
                        style={{objectFit: 'cover'}}
                        data-ai-hint={test.dataAiHint || "laboratory image"}
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                    {test.labName && (
                      <p className="text-sm text-primary font-medium">{test.labName}</p>
                    )}
                  </CardHeader>
                  <CardContent className="flex-grow space-y-1.5">
                    <p className="text-sm text-muted-foreground">{test.description}</p>
                    {test.location && (
                      <p className="text-xs text-muted-foreground flex items-center"><MapPin className="w-3 h-3 mr-1" /> {test.location}</p>
                    )}
                    <div className="flex items-center justify-between">
                      {test.price && <p className="text-foreground font-semibold">₹{test.price}</p>}
                      {test.rating && (
                        <Badge variant="outline" className="text-xs border-amber-400 text-amber-600 bg-amber-50/50">
                          <Star className="w-3 h-3 mr-1 text-amber-500 fill-amber-500" /> {test.rating.toFixed(1)}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-3">
                    <Button className="w-full btn-premium rounded-md" onClick={() => handleBookTest(test.name, test.labName)}>
                      <CalendarPlus className="mr-2 h-4 w-4" /> Request Booking
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
             <div className="text-center py-12">
              <FlaskConical className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No Lab Tests Available Currently</h3>
              <p className="text-muted-foreground">
                Please check back later or contact support for assistance.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
