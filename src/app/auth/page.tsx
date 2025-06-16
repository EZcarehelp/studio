
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserPlus, LogIn } from "lucide-react"; 
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { addDoctor, addPatient, addLabWorker, isUsernameUnique } from '@/lib/firebase/firestore'; 
import type { Doctor, UserProfile } from '@/types';

const ADMIN_EMAIL = "ezcarehelp@gmail.com";
const ADMIN_PASSWORD = "VARUNARUN"; // In a real app, NEVER hardcode passwords on the client.

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const initialTab = searchParams.get('tab') || 'login';
  const [userType, setUserType] = useState<'patient' | 'doctor' | 'lab_worker'>('patient');
  
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailValue = (event.currentTarget.elements.namedItem('email-login') as HTMLInputElement).value;
    const passwordValue = (event.currentTarget.elements.namedItem('password-login') as HTMLInputElement).value;

    if (emailValue === ADMIN_EMAIL && passwordValue === ADMIN_PASSWORD) {
      toast({ title: "Admin Login Successful", description: "Redirecting to Admin Dashboard..." });
      router.push('/admin/dashboard');
      return;
    }
    
    // Mock login for other roles based on email/phone hints
    // This is NOT secure and for demo purposes only.
    console.log("Logging in...");
    toast({ title: "Login Successful", description: "Redirecting to dashboard..." });
    
    let role = 'patient'; 
    if (emailValue.includes('doc@') || (event.currentTarget.elements.namedItem('phone-login') as HTMLInputElement)?.value.includes('doc')) {
      role = 'doctor';
    } else if (emailValue.includes('lab@') || (event.currentTarget.elements.namedItem('phone-login') as HTMLInputElement)?.value.includes('lab')) {
      role = 'lab_worker';
    }

    if (role === 'doctor') {
      router.push('/doctor/dashboard');
    } else if (role === 'lab_worker') {
      router.push('/lab/dashboard');
    } else {
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
    const username = formData.get('username') as string;

    if (email === ADMIN_EMAIL) {
      toast({ variant: "destructive", title: "Registration Restricted", description: "This email address is reserved. Please use a different email." });
      return;
    }

    // Username validation
    if (!username) {
      toast({ variant: "destructive", title: "Username Required", description: "Please enter a username." });
      return;
    }
    const usernameRegex = /^[a-zA-Z0-9._]{3,30}$/;
    if (!usernameRegex.test(username)) {
      toast({ variant: "destructive", title: "Invalid Username", description: "Username must be 3-30 characters and can only contain letters, numbers, periods (.), and underscores (_)." });
      return;
    }

    const isUnique = await isUsernameUnique(username.toLowerCase());
    if (!isUnique) {
      toast({ variant: "destructive", title: "Username Taken", description: "This username is already in use. Please choose another." });
      return;
    }
    
    const finalUsername = username.toLowerCase(); 

    console.log("Signing up as", userType);
    
    try {
      if (userType === 'doctor') {
        const specialty = formData.get('specialization') as string;
        const experienceStr = formData.get('experience') as string;
        const licenseNumber = formData.get('licenseNumber') as string;

        if (!experienceStr || isNaN(parseInt(experienceStr, 10)) || parseInt(experienceStr, 10) < 0) {
            toast({ variant: "destructive", title: "Invalid Input", description: "Years of experience must be a valid non-negative number." });
            return;
        }
        const experience = parseInt(experienceStr, 10);

        const doctorData: Omit<Doctor, 'id' | 'rating' | 'availability' | 'imageUrl' | 'dataAiHint' | 'createdAt'> & { username: string } = {
          name,
          username: finalUsername,
          specialty,
          experience,
          consultationFee: 1000, 
          location: locationInput, 
          licenseNumber,
          clinicHours: "Mon-Fri: 9 AM - 5 PM", 
          onlineConsultationEnabled: true,
          isVerified: true, // Auto-verified for now, admin panel would handle this
        };
        await addDoctor(doctorData); 
        toast({ title: "Doctor Sign Up Successful", description: `Dr. ${name}'s profile is now live. Approval pending by admin.` });
        router.push('/doctor/dashboard'); 
      } else if (userType === 'lab_worker') {
        const labAffiliation = formData.get('labId') as string; 
        const labWorkerData = {
          name,
          username: finalUsername,
          phone,
          email,
          location: locationInput,
          labAffiliation,
        };
        await addLabWorker(labWorkerData as Omit<UserProfile, 'id' | 'avatarUrl' | 'medicalHistory' | 'savedAddresses' | 'paymentMethods' | 'doctorDetails' | 'createdAt' | 'role'> & { labAffiliation: string, username: string });
        toast({ title: "Lab Worker Sign Up Successful", description: `Account for ${name} at ${labAffiliation} created. Approval pending by admin.` });
        router.push('/lab/dashboard');
      } else { 
        const patientData = {
          name,
          username: finalUsername,
          phone,
          email,
          location: locationInput,
        };
        await addPatient(patientData as Omit<UserProfile, 'id' | 'avatarUrl' | 'medicalHistory' | 'savedAddresses' | 'paymentMethods' | 'doctorDetails' | 'labAffiliation' | 'createdAt' | 'role'> & { username: string });
        toast({ title: "Patient Sign Up Successful", description: `Account created for ${name}.` });
        router.push('/patient/dashboard');
      }
    } catch (error) {
        console.error(`Error during ${userType} signup:`, error);
        toast({ variant: "destructive", title: "Signup Failed", description: `Could not create ${userType} account. ${error instanceof Error ? error.message : 'An unexpected error occurred.'}` });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
         <Image
            src="/logo.svg" 
            alt="EzCare Simplified Logo"
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
              <CardDescription>Access your EzCare Simplified account. <br />(Hint: Use 'doc@', 'lab@' in email for roles)</CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">Email Address</Label>
                  <Input id="email-login" name="email-login" type="email" placeholder="Enter your email" required aria-label="Email address for login" />
                </div>
                {/* <div className="space-y-2">
                  <Label htmlFor="phone-login">Phone Number (Optional)</Label>
                  <Input id="phone-login" name="phone-login" type="tel" placeholder="Enter your phone number" aria-label="Phone number for login" />
                </div> */}
                <div className="space-y-2">
                  <Label htmlFor="password-login">Password</Label>
                  <Input id="password-login" name="password-login" type="password" placeholder="Enter your password" required aria-label="Password for login" />
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
              <CardDescription>Join EzCare Simplified today.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>I am a:</Label>
                  <RadioGroup 
                    defaultValue="patient" 
                    onValueChange={(value: 'patient' | 'doctor' | 'lab_worker') => setUserType(value)} 
                    className="flex gap-4 flex-wrap"
                    aria-label="Select account type"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="patient" id="patient" aria-labelledby="patient-label"/>
                      <Label htmlFor="patient" id="patient-label">Patient</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="doctor" id="doctor" aria-labelledby="doctor-label"/>
                      <Label htmlFor="doctor" id="doctor-label">Doctor</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lab_worker" id="lab_worker" aria-labelledby="lab_worker-label"/>
                      <Label htmlFor="lab_worker" id="lab_worker-label">Lab Worker</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName-signup">Full Name</Label>
                  <Input id="fullName-signup" name="fullName" placeholder="Enter your full name" required aria-label="Full name for signup" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="username-signup">Username</Label>
                  <Input id="username-signup" name="username" placeholder="e.g., ezcare_user (a-z, 0-9, _, .)" required aria-label="Username for signup" />
                  <p className="text-xs text-muted-foreground">3-30 characters. No special symbols except '.' and '_'.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email Address</Label>
                  <Input id="email-signup" name="email-signup" type="email" placeholder="Enter your email address" required aria-label="Email address for signup" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone-signup">Phone Number</Label>
                  <Input id="phone-signup" name="phone" type="tel" placeholder="Enter your phone number" required aria-label="Phone number for signup" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <Input id="password-signup" name="password" type="password" placeholder="Create a password" required aria-label="Password for signup" />
                </div>

                {(userType === 'doctor' || userType === 'lab_worker' || userType === 'patient') && (
                    <div className="space-y-2">
                      <Label htmlFor="location-common">Location (City, State or Full Address)</Label>
                      <Input id="location-common" name="location" placeholder="e.g., New York, NY or 123 Main St, City" required aria-label="Location for signup" />
                    </div>
                )}

                {userType === 'doctor' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber-signup">License Number</Label>
                      <Input id="licenseNumber-signup" name="licenseNumber" placeholder="Enter your medical license number" required aria-label="Medical license number for doctor signup" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialization-signup">Specialization</Label>
                      <Input id="specialization-signup" name="specialization" placeholder="e.g., Cardiologist" required aria-label="Specialization for doctor signup" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience-signup">Years of Experience</Label>
                      <Input id="experience-signup" name="experience" type="number" placeholder="e.g., 5" required min="0" aria-label="Years of experience for doctor signup"/>
                    </div>
                    <p className="text-xs text-muted-foreground">Your profile may require admin approval to go live.</p>
                  </>
                )}
                {userType === 'lab_worker' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="labId-signup">Laboratory ID / Affiliation</Label>
                      <Input id="labId-signup" name="labId" placeholder="Enter your lab ID or affiliation" required aria-label="Laboratory ID or affiliation for lab worker signup" />
                    </div>
                     <p className="text-xs text-muted-foreground">Your account may require admin approval.</p>
                  </>
                )}
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms-signup" name="terms" required aria-labelledby="terms-label"/>
                  <Label htmlFor="terms-signup" id="terms-label" className="text-sm font-normal">
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


    