
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, DollarSign, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Mock current fee data - in a real app, this would be fetched
const initialFeeData = {
  inClinicFee: "1000",
  onlineConsultationFee: "800",
  // Placeholder for location-specific fees
};

export default function DoctorFeeSettingsPage() {
  const { toast } = useToast();
  const [fees, setFees] = useState(initialFeeData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFees(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Updated Fee Settings:", fees);
    toast({
      title: "Fee Settings Updated (Mock)",
      description: "Your consultation fee settings have been conceptually updated.",
      variant: "success"
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <Banknote className="mr-3 h-7 w-7" />
            Fee Settings
          </CardTitle>
          <CardDescription>
            Set and manage your consultation charges for in-clinic and online appointments.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="inClinicFee" className="flex items-center"><DollarSign className="w-4 h-4 mr-2 opacity-70"/>In-clinic Consultation Fee (INR)</Label>
              <Input id="inClinicFee" name="inClinicFee" type="number" value={fees.inClinicFee} onChange={handleInputChange} placeholder="e.g., 1000" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="onlineConsultationFee" className="flex items-center"><DollarSign className="w-4 h-4 mr-2 opacity-70"/>Online Consultation Fee (INR)</Label>
              <Input id="onlineConsultationFee" name="onlineConsultationFee" type="number" value={fees.onlineConsultationFee} onChange={handleInputChange} placeholder="e.g., 800" />
            </div>
            
            <div className="space-y-2 p-4 border border-dashed rounded-md bg-muted/30">
                <h4 className="font-medium text-sm flex items-center"><MapPin className="w-4 h-4 mr-2 text-primary"/>Location-Specific Fees</h4>
                <p className="text-xs text-muted-foreground">
                    Setting different fees for various clinic locations will be available soon. You'll also be able to manage digital payment options here.
                </p>
            </div>

            <Button type="submit" className="w-full btn-premium rounded-md">Save Fee Settings</Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
