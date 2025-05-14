
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Image as ImageIcon, UserCheck, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const initialPrescriptionSettings = {
  headerText: "Dr. Emily Carter | Cardiologist | Reg. No: 12345",
  clinicLogoUrl: "", // Placeholder for logo URL
  defaultInstructions: "Take medications as prescribed. Follow up if symptoms worsen. Keep this prescription for your records.",
  includeDoctorSignature: true,
  format: "e-prescription", // 'e-prescription' or 'printable'
};

export default function DoctorPrescriptionSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(initialPrescriptionSettings);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (name: keyof typeof initialPrescriptionSettings) => {
     setSettings(prev => ({ ...prev, [name]: !prev[name] }));
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
      // In a real app, you'd upload this and get a URL to save in settings.clinicLogoUrl
      toast({ title: "Logo Selected", description: `${e.target.files[0].name} ready for mock upload.`});
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Updated Prescription Settings:", settings);
    if (logoFile) console.log("New Logo File:", logoFile.name);
    toast({
      title: "Prescription Settings Updated (Mock)",
      description: "Your default prescription format has been conceptually updated.",
      variant: "success"
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <FileText className="mr-3 h-7 w-7" />
            Prescription Settings
          </CardTitle>
          <CardDescription>
            Customize your default prescription format, header, and other related details.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="headerText">Prescription Header Text</Label>
              <Input id="headerText" name="headerText" value={settings.headerText} onChange={handleInputChange} placeholder="e.g., Your Name | Specialization | Reg. No" />
              <p className="text-xs text-muted-foreground">This text appears at the top of your prescriptions.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinicLogo">Clinic/Personal Logo (Optional)</Label>
              <Input id="clinicLogo" name="clinicLogo" type="file" accept="image/*" onChange={handleFileChange} className="text-sm"/>
              {logoFile && <p className="text-xs text-muted-foreground mt-1">Selected: {logoFile.name}</p>}
              {settings.clinicLogoUrl && !logoFile && <img src={settings.clinicLogoUrl} alt="Current logo" className="mt-2 h-16 w-auto" data-ai-hint="clinic logo"/>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultInstructions">Default Patient Instructions</Label>
              <Textarea id="defaultInstructions" name="defaultInstructions" value={settings.defaultInstructions} onChange={handleInputChange} placeholder="e.g., Take after meals, complete the full course..." className="min-h-[80px]" />
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="includeDoctorSignature" className="flex items-center space-x-2 cursor-pointer">
                <UserCheck className="w-5 h-5 text-primary" />
                <span>Include Digital Signature Placeholder</span>
              </Label>
              <Input 
                type="checkbox" 
                id="includeDoctorSignature" 
                name="includeDoctorSignature"
                checked={!!settings.includeDoctorSignature} // Ensure it's boolean
                onChange={() => handleCheckboxChange('includeDoctorSignature')}
                className="h-4 w-4"
              />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="format" className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-primary" />
                    <span>Prescription Format</span>
                </Label>
                 <select 
                    id="format" 
                    name="format" 
                    value={settings.format} 
                    onChange={(e) => setSettings(prev => ({...prev, format: e.target.value}))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    <option value="e-prescription">E-Prescription (Digital)</option>
                    <option value="printable">Printable PDF</option>
                </select>
                <p className="text-xs text-muted-foreground">Choose the default output format for your prescriptions.</p>
            </div>


            <Button type="submit" className="w-full btn-premium rounded-md">Save Prescription Settings</Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
