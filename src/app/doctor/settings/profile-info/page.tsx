
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserCircle, Edit3, Briefcase, MapPin, UploadCloud, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Mock current doctor data - in a real app, this would be fetched
const mockDoctorData = {
  name: "Dr. Emily Carter",
  specialty: "Cardiologist",
  clinicName: "Heartbeat Clinic",
  clinicAddress: "123 Health St, MedCity, NY 10001",
  qualifications: "MBBS, MD (Cardiology), FACC",
  bio: "Dedicated cardiologist with 10+ years of experience in managing complex heart conditions.",
  profilePhotoUrl: "https://placehold.co/200x200.png"
};

export default function DoctorProfileInfoPage() {
  const { toast } = useToast();
  const [doctorInfo, setDoctorInfo] = useState(mockDoctorData);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDoctorInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
      // You might want to show a preview here
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend/Firebase
    console.log("Updated Doctor Info:", doctorInfo);
    if (profilePhoto) {
      console.log("New Profile Photo:", profilePhoto.name);
    }
    toast({
      title: "Profile Updated (Mock)",
      description: "Your profile information has been conceptually updated.",
      variant: "success"
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <UserCircle className="mr-3 h-7 w-7" />
            Profile & Practice Information
          </CardTitle>
          <CardDescription>
            Manage your public profile, clinic details, and qualifications.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center"><UserCircle className="w-4 h-4 mr-2 opacity-70" />Doctor Name</Label>
              <Input id="name" name="name" value={doctorInfo.name} onChange={handleInputChange} placeholder="e.g., Dr. John Doe" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty" className="flex items-center"><Briefcase className="w-4 h-4 mr-2 opacity-70" />Specialization</Label>
              <Input id="specialty" name="specialty" value={doctorInfo.specialty} onChange={handleInputChange} placeholder="e.g., Cardiologist" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profilePhoto" className="flex items-center"><UploadCloud className="w-4 h-4 mr-2 opacity-70" />Profile Photo</Label>
              <Input id="profilePhoto" name="profilePhoto" type="file" accept="image/*" onChange={handleFileChange} className="text-sm"/>
              {doctorInfo.profilePhotoUrl && !profilePhoto && (
                <img src={doctorInfo.profilePhotoUrl} alt="Current profile" className="mt-2 h-20 w-20 rounded-full object-cover" data-ai-hint="doctor avatar"/>
              )}
               {profilePhoto && (
                <p className="text-xs text-muted-foreground mt-1">Selected: {profilePhoto.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinicName" className="flex items-center"><Briefcase className="w-4 h-4 mr-2 opacity-70" />Clinic/Hospital Name</Label>
              <Input id="clinicName" name="clinicName" value={doctorInfo.clinicName} onChange={handleInputChange} placeholder="e.g., City General Hospital" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinicAddress" className="flex items-center"><MapPin className="w-4 h-4 mr-2 opacity-70" />Clinic Address</Label>
              <Textarea id="clinicAddress" name="clinicAddress" value={doctorInfo.clinicAddress} onChange={handleInputChange} placeholder="Street, City, State, Zip Code" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="qualifications" className="flex items-center"><Award className="w-4 h-4 mr-2 opacity-70" />Qualifications</Label>
              <Textarea id="qualifications" name="qualifications" value={doctorInfo.qualifications} onChange={handleInputChange} placeholder="e.g., MBBS, MD, PhD" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center"><Edit3 className="w-4 h-4 mr-2 opacity-70" />About You / Bio</Label>
              <Textarea id="bio" name="bio" value={doctorInfo.bio} onChange={handleInputChange} placeholder="Brief introduction, experience, approach to care..." className="min-h-[100px]" />
            </div>

            <Button type="submit" className="w-full btn-premium rounded-md">Save Changes</Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
