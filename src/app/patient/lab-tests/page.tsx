
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { FlaskConical, CalendarPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { LabTest } from "@/types";

// Mock lab tests - in a real app, this would come from a database
const mockLabTests: LabTest[] = [
  { id: 'lt1', name: 'Complete Blood Count (CBC)', description: 'Measures different components of your blood, such as red and white blood cells, platelets, and hemoglobin.', price: 500 },
  { id: 'lt2', name: 'Lipid Panel (Cholesterol Test)', description: 'Measures fats and fatty substances used as a source of energy by your body, including cholesterol and triglycerides.', price: 750 },
  { id: 'lt3', name: 'Basic Metabolic Panel (BMP)', description: 'Measures glucose, sodium, potassium, calcium, chloride, carbon dioxide, blood urea nitrogen (BUN), and creatinine.', price: 600 },
  { id: 'lt4', name: 'Urinalysis', description: 'Checks for various compounds that pass through your urine, helping detect kidney diseases, diabetes, and urinary tract infections.', price: 300 },
  { id: 'lt5', name: 'Thyroid Stimulating Hormone (TSH) Test', description: 'Measures the level of TSH in your blood, which can indicate thyroid problems.', price: 450 },
];


export default function PatientLabTestsPage() {
  const { toast } = useToast();

  const handleBookTest = (testName: string) => {
    toast({
      title: "Test Booking Requested",
      description: `Your request to book "${testName}" has been sent. A lab representative will contact you shortly.`,
      variant: "success",
    });
    console.log(`Booking request for ${testName}`);
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
            Browse available lab tests and request a booking. Our affiliated labs offer home sample collection or center visits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mockLabTests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockLabTests.map((test) => (
                <Card key={test.id} className="flex flex-col card-gradient">
                  <CardHeader>
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                    {test.price && <p className="text-primary font-semibold">₹{test.price}</p>}
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">{test.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full btn-premium rounded-md" onClick={() => handleBookTest(test.name)}>
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
