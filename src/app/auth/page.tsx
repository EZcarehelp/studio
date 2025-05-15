
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserPlus, LogIn, Store } from "lucide-react"; 
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { addDoctor, addPharmacist } from '@/lib/firebase/firestore'; 
import type { Doctor, PharmacyProfile, UserProfile } from '@/types';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const initialTab = searchParams.get('tab') || 'login';
  const [userType, setUserType] = useState<'patient' | 'doctor' | 'lab_worker' | 'pharmacist'>('patient');
  
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Logging in...");
    toast({ title: "Login Successful", description: "Redirecting to dashboard..." });
    
    const phoneValue = (event.currentTarget.elements.namedItem('phone-login') as HTMLInputElement).value;
    let role = 'patient'; 
    if (phoneValue.includes('doc')) {
      role = 'doctor';
    } else if (phoneValue.includes('lab')) {
      role = 'lab_worker';
    } else if (phoneValue.includes('pharm')) { 
      role = 'pharmacist';
    }

    if (role === 'doctor') {
      router.push('/doctor/dashboard');
    } else if (role === 'lab_worker') {
      router.push('/lab/dashboard');
    } else if (role === 'pharmacist') {
      router.push('/pharmacist/dashboard');
    }
     else {
      router.push('/patient/dashboard');
    }
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email-signup') as string; 
    const locationInput = formData.get('location') as string; 

    console.log("Signing up as", userType);
    
    if (userType === 'doctor') {
      const specialty = formData.get('specialization') as string;
      const experience = parseInt(formData.get('experience') as string, 10);
      const licenseNumber = formData.get('licenseNumber') as string;

      const doctorData: Omit<Doctor, 'id' | 'rating' | 'availability' | 'imageUrl' | 'dataAiHint'> & { isVerified: boolean } = {
        name,
        specialty,
        experience,
        consultationFee: 1000, 
        location: locationInput, 
        licenseNumber,
        clinicHours: "Mon-Fri: 9 AM - 5 PM", 
        onlineConsultationEnabled: true,
        isVerified: true, // Set isVerified to true by default
      };
      try {
        await addDoctor(doctorData); 
        toast({ title: "Doctor Sign Up Successful", description: `Dr. ${name}'s profile is now live and discoverable.` });
        router.push('/doctor/dashboard'); 
      } catch (error) {
        console.error("Doctor signup error:", error);
        toast({ variant: "destructive", title: "Signup Failed", description: "Could not create doctor account." });
      }
    } else if (userType === 'lab_worker') {
      toast({ title: "Lab Worker Sign Up Successful", description: `Account created. Please verify if applicable.` });
      router.push('/lab/dashboard');
    } else if (userType === 'pharmacist') {
      const pharmacyName = formData.get('pharmacyName') as string;
      const pharmacyLicense = formData.get('pharmacyLicense') as string;
      
      const pharmacistSignupData = {
        name,
        phone,
        email,
        role: 'pharmacist' as const,
        location: locationInput,
        pharmacyDetails: {
          pharmacyName,
          licenseNumber: pharmacyLicense,
        },
      };
      try {
        await addPharmacist(pharmacistSignupData as Omit<UserProfile, 'id' | 'avatarUrl' | 'medicalHistory' | 'savedAddresses' | 'paymentMethods' | 'doctorDetails' | 'pharmacyDetails'> & { pharmacyDetails: Omit<PharmacyProfile, 'id' | 'latitude' | 'longitude'> });
        toast({ title: "Pharmacist Sign Up Successful", description: `Account for ${pharmacyName} created. Location conceptually geocoded.` });
        router.push('/pharmacist/dashboard');
      } catch (error) {
        console.error("Pharmacist signup error:", error);
        toast({ variant: "destructive", title: "Signup Failed", description: "Could not create pharmacist account." });
      }
    }
     else { // Patient
      toast({ title: "Patient Sign Up Successful", description: `Account created for ${name}.` });
      router.push('/patient/dashboard');
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
         <Image
            src="/logo.svg" 
            alt="EzCare Connect Logo"
            width={180} 
            height={63} 
            priority
          />
      </Link>
      <Tabs defaultValue={initialTab} className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login"><LogIn className="mr-2 h-4 w-4" />Login</TabsTrigger>
          <TabsTrigger value="signup"><UserPlus className="mr-2 h-4 w-4" />Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>Access your EzCare Connect account. <br />(Hint: use 'doc', 'lab', or 'pharm' in phone for roles)</CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-login">Phone Number</Label>
                  <Input id="phone-login" name="phone-login" type="tel" placeholder="Enter your phone number" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login">Password</Label>
                  <Input id="password-login" name="password-login" type="password" placeholder="Enter your password" required />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full btn-premium">Login</Button>
                 <Link href="/" className="text-sm text-primary hover:underline">
                    Skip for now & browse
                </Link>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>Join EzCare Connect today.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>I am a:</Label>
                  <RadioGroup 
                    defaultValue="patient" 
                    onValueChange={(value: 'patient' | 'doctor' | 'lab_worker' | 'pharmacist') => setUserType(value)} 
                    className="flex gap-4 flex-wrap"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="patient" id="patient" />
                      <Label htmlFor="patient">Patient</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="doctor" id="doctor" />
                      <Label htmlFor="doctor">Doctor</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lab_worker" id="lab_worker" />
                      <Label htmlFor="lab_worker">Lab Worker</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pharmacist" id="pharmacist" />
                      <Label htmlFor="pharmacist">Pharmacist</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name-signup">Full Name</Label>
                  <Input id="name-signup" name="fullName" placeholder="Enter your full name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email Address</Label>
                  <Input id="email-signup" name="email-signup" type="email" placeholder="Enter your email address" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone-signup">Phone Number</Label>
                  <Input id="phone-signup" name="phone" type="tel" placeholder="Enter your phone number" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <Input id="password-signup" name="password" type="password" placeholder="Create a password" required />
                </div>

                {(userType === 'doctor' || userType === 'pharmacist' || userType === 'lab_worker') && (
                    <div className="space-y-2">
                      <Label htmlFor="location-common">Location (City, State or Full Address)</Label>
                      <Input id="location-common" name="location" placeholder="e.g., New York, NY or 123 Main St, City" required />
                    </div>
                )}

                {userType === 'doctor' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="license">License Number</Label>
                      <Input id="license" name="licenseNumber" placeholder="Enter your medical license number" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input id="specialization" name="specialization" placeholder="e.g., Cardiologist" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input id="experience" name="experience" type="number" placeholder="e.g., 5" required />
                    </div>
                    <p className="text-xs text-muted-foreground">Your profile will be live immediately.</p>
                  </>
                )}
                {userType === 'lab_worker' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="lab-id">Laboratory ID / Affiliation</Label>
                      <Input id="lab-id" name="labId" placeholder="Enter your lab ID or affiliation" required />
                    </div>
                     <p className="text-xs text-muted-foreground">Your account may be subject to verification.</p>
                  </>
                )}
                {userType === 'pharmacist' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="pharmacyName">Pharmacy Name</Label>
                      <Input id="pharmacyName" name="pharmacyName" placeholder="Enter pharmacy name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pharmacyLicense">Pharmacy License Number</Label>
                      <Input id="pharmacyLicense" name="pharmacyLicense" placeholder="Enter pharmacy license number" required />
                    </div>
                     <p className="text-xs text-muted-foreground">Your account may be subject to verification. Your location will be geocoded.</p>
                  </>
                )}
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" name="terms" required />
                  <Label htmlFor="terms" className="text-sm font-normal">
                    I agree to the <Link href="/terms" className="underline text-primary">Terms and Conditions</Link>
                  </Label>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full btn-premium">Sign Up</Button>
                 <Link href="/" className="text-sm text-primary hover:underline">
                    Skip for now & browse
                </Link>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    