
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, Edit3, CalendarIcon, Phone, Mail, UploadCloud, Users, MapPinIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock current patient data - in a real app, this would be fetched
const mockPatientData = {
  name: "Jane Patient",
  dob: "1990-05-15",
  gender: "female",
  phone: "9876543210",
  email: "jane.patient@example.com",
  profilePhotoUrl: "https://placehold.co/200x200.png",
  primaryAddress: "456 Park Ave, Townsville, CA 90210"
};

export default function PatientProfileInfoPage() {
  const { toast } = useToast();
  const [patientInfo, setPatientInfo] = useState(mockPatientData);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPatientInfo(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setPatientInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Updated Patient Info:", patientInfo);
    if (profilePhoto) console.log("New Profile Photo:", profilePhoto.name);
    toast({
      title: "Profile Updated (Mock)",
      description: "Your personal information has been conceptually updated.",
      variant: "success"
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <UserCircle className="mr-3 h-7 w-7" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Manage your name, date of birth, gender, contact details, and profile picture.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center"><Edit3 className="w-4 h-4 mr-2 opacity-70" />Full Name</Label>
              <Input id="name" name="name" value={patientInfo.name} onChange={handleInputChange} placeholder="e.g., Jane Patient" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob" className="flex items-center"><CalendarIcon className="w-4 h-4 mr-2 opacity-70" />Date of Birth</Label>
                  <Input id="dob" name="dob" type="date" value={patientInfo.dob} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="flex items-center"><Users className="w-4 h-4 mr-2 opacity-70" />Gender</Label>
                  <Select name="gender" value={patientInfo.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center"><Phone className="w-4 h-4 mr-2 opacity-70" />Phone Number</Label>
                <Input id="phone" name="phone" type="tel" value={patientInfo.phone} onChange={handleInputChange} placeholder="e.g., 9876543210" />
                </div>
                <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center"><Mail className="w-4 h-4 mr-2 opacity-70" />Email Address</Label>
                <Input id="email" name="email" type="email" value={patientInfo.email} onChange={handleInputChange} placeholder="e.g., jane@example.com" />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profilePhoto" className="flex items-center"><UploadCloud className="w-4 h-4 mr-2 opacity-70" />Profile Photo</Label>
              <Input id="profilePhoto" name="profilePhoto" type="file" accept="image/*" onChange={handleFileChange} className="text-sm"/>
              {patientInfo.profilePhotoUrl && !profilePhoto && (
                <img src={patientInfo.profilePhotoUrl} alt="Current profile" className="mt-2 h-20 w-20 rounded-full object-cover" data-ai-hint="user avatar"/>
              )}
               {profilePhoto && (
                <p className="text-xs text-muted-foreground mt-1">Selected: {profilePhoto.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryAddress" className="flex items-center"><MapPinIcon className="w-4 h-4 mr-2 opacity-70" />Primary Address</Label>
              <Input id="primaryAddress" name="primaryAddress" value={patientInfo.primaryAddress} onChange={handleInputChange} placeholder="Street, City, State, Zip" />
            </div>


            <Button type="submit" className="w-full btn-premium rounded-md">Save Personal Info</Button>
          </CardContent>
        </form>
      </Card>
       <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Family Members’ Profiles
          </CardTitle>
          <CardDescription>
            Manage health profiles for your family members. (Feature coming soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground text-center py-4">This section will allow you to add and manage profiles for your dependents.</p>
        </CardContent>
      </Card>
    </div>
  );
}
