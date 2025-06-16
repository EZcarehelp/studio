
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserPlus, LogIn, UploadCloud } from "lucide-react"; 
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { addDoctor, addPatient, addLabWorker, isUsernameUnique, getUserProfileByUID } from '@/lib/firebase/firestore'; 
import type { Doctor, UserProfile } from '@/types';
import { uploadFileToStorage } from '@/lib/firebase/storage';
import { auth } from '@/lib/firebase/config'; // Import Firebase Auth instance
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  type AuthError
} from "firebase/auth";

const ADMIN_EMAIL = "ezcarehelp@gmail.com";
const ADMIN_PASSWORD = "VARUNARUN"; 

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const initialTab = searchParams.get('tab') || 'login';
  const [userType, setUserType] = useState<'patient' | 'doctor' | 'lab_worker'>('patient');
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const emailValue = (event.currentTarget.elements.namedItem('email-login') as HTMLInputElement).value;
    const passwordValue = (event.currentTarget.elements.namedItem('password-login') as HTMLInputElement).value;

    // Admin login check (remains hardcoded for now)
    if (emailValue === ADMIN_EMAIL && passwordValue === ADMIN_PASSWORD) {
      toast({ title: "Admin Login Successful", description: "Redirecting to Admin Dashboard...", variant: "success" });
      router.push('/admin/dashboard');
      setIsLoading(false);
      return;
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, emailValue, passwordValue);
      const firebaseUser = userCredential.user;
      console.log("Firebase Auth Login Successful for UID: ", firebaseUser.uid);

      // Fetch user profile from Firestore to determine role and redirect
      const userProfile = await getUserProfileByUID(firebaseUser.uid);

      if (userProfile) {
        toast({ title: "Login Successful", description: "Redirecting to dashboard...", variant: "success" });
        if (userProfile.role === 'doctor') {
          router.push('/doctor/dashboard');
        } else if (userProfile.role === 'lab_worker') {
          router.push('/lab/dashboard');
        } else if (userProfile.role === 'patient') {
          router.push('/patient/dashboard');
        } else {
          // Fallback if role is not set or unexpected, though unlikely if signup is correct
          toast({ variant: "destructive", title: "Login Error", description: "User role not found. Please contact support."});
          router.push('/'); 
        }
      } else {
        // This case should ideally not happen if sign-up correctly creates Firestore doc.
        // Could indicate an issue where Auth user exists but Firestore profile doesn't.
        toast({ variant: "destructive", title: "Login Error", description: "User profile not found. Please sign up or contact support." });
        // Optionally, sign out the user from Firebase Auth here
        // await auth.signOut();
      }
    } catch (error) {
      const authError = error as AuthError;
      console.error("Firebase Auth Login Error: ", authError);
      let errorMessage = "Failed to login. Please check your credentials.";
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password.";
      } else if (authError.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      }
      toast({ variant: "destructive", title: "Login Failed", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // Max 5MB
        toast({ variant: "destructive", title: "File too large", description: "Profile picture must be smaller than 5MB." });
        if(fileInputRef.current) fileInputRef.current.value = "";
        setProfilePictureFile(null);
        setProfilePicturePreview(null);
        return;
      }
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
        setProfilePictureFile(null);
        setProfilePicturePreview(null);
    }
  };

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const name = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email-signup') as string; 
    const password = formData.get('password-signup') as string;
    const locationInput = formData.get('location') as string;
    const username = formData.get('username') as string;

    if (email === ADMIN_EMAIL) {
      toast({ variant: "destructive", title: "Registration Restricted", description: "This email address is reserved for admin. Please use a different email." });
      setIsLoading(false);
      return;
    }

    if (!username) {
      toast({ variant: "destructive", title: "Username Required", description: "Please enter a username." });
      setIsLoading(false);
      return;
    }
    const usernameRegex = /^[a-zA-Z0-9._]{3,30}$/;
    if (!usernameRegex.test(username)) {
      toast({ variant: "destructive", title: "Invalid Username", description: "Username must be 3-30 characters and can only contain letters, numbers, periods (.), and underscores (_)." });
      setIsLoading(false);
      return;
    }

    const isUnique = await isUsernameUnique(username.toLowerCase());
    if (!isUnique) {
      toast({ variant: "destructive", title: "Username Taken", description: "This username is already in use. Please choose another." });
      setIsLoading(false);
      return;
    }
    
    const finalUsername = username.toLowerCase(); 
    let avatarUrl: string | undefined = undefined;

    if (profilePictureFile) {
      try {
        const fileName = `profile_${Date.now()}_${profilePictureFile.name}`;
        avatarUrl = await uploadFileToStorage(profilePictureFile, `profilePictures/${finalUsername}`, fileName);
      } catch (uploadError) {
        console.error("Error uploading profile picture:", uploadError);
        toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload profile picture. Please try again or continue without one." });
        // Optionally, allow signup without picture or return
      }
    }
    
    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const uid = firebaseUser.uid;

      // 2. Add user details to Firestore
      if (userType === 'doctor') {
        const specialty = formData.get('specialization') as string;
        const experienceStr = formData.get('experience') as string;
        const licenseNumber = formData.get('licenseNumber') as string;

        if (!experienceStr || isNaN(parseInt(experienceStr, 10)) || parseInt(experienceStr, 10) < 0) {
            toast({ variant: "destructive", title: "Invalid Input", description: "Years of experience must be a valid non-negative number." });
            setIsLoading(false);
            return;
        }
        const experience = parseInt(experienceStr, 10);

        const doctorData = {
          uid, name, username: finalUsername, email, phone, specialty, experience,
          consultationFee: 1000, location: locationInput, licenseNumber,
          clinicHours: "Mon-Fri: 9 AM - 5 PM", onlineConsultationEnabled: true,
          imageUrl: avatarUrl, 
        };
        await addDoctor(doctorData as Omit<Doctor, 'id' | 'rating' | 'availability' | 'isVerified' | 'dataAiHint' | 'createdAt'> & { username: string, uid: string }); 
        toast({ title: "Doctor Sign Up Successful", description: `Dr. ${name}'s profile created. Approval pending by admin.`, variant: "success" });
        router.push('/doctor/dashboard'); 
      } else if (userType === 'lab_worker') {
        const labAffiliation = formData.get('labId') as string; 
        const labWorkerData = {
          uid, name, username: finalUsername, email, phone, location: locationInput,
          labAffiliation, avatarUrl, 
        };
        await addLabWorker(labWorkerData as Omit<UserProfile, 'id' | 'medicalHistory' | 'savedAddresses' | 'paymentMethods' | 'doctorDetails' | 'role' | 'createdAt'> & { labAffiliation: string, username: string, uid: string });
        toast({ title: "Lab Worker Sign Up Successful", description: `Account for ${name} at ${labAffiliation} created. Approval pending.`, variant: "success" });
        router.push('/lab/dashboard');
      } else { 
        const patientData = {
          uid, name, username: finalUsername, email, phone, location: locationInput,
          avatarUrl, 
        };
        await addPatient(patientData as Omit<UserProfile, 'id' | 'medicalHistory' | 'savedAddresses' | 'paymentMethods' | 'doctorDetails' | 'labAffiliation' | 'role' | 'createdAt'> & { username: string, uid: string });
        toast({ title: "Patient Sign Up Successful", description: `Account created for ${name}.`, variant: "success" });
        router.push('/patient/dashboard');
      }
    } catch (error) {
        const authError = error as AuthError;
        console.error(`Error during ${userType} signup:`, authError);
        let errorMessage = `Could not create ${userType} account.`;
        if (authError.code === 'auth/email-already-in-use') {
            errorMessage = "This email is already registered. Please login or use a different email.";
        } else if (authError.code === 'auth/weak-password') {
            errorMessage = "Password is too weak. Please choose a stronger password (at least 6 characters).";
        } else if (authError.code === 'auth/invalid-email') {
            errorMessage = "The email address is not valid.";
        }
        toast({ variant: "destructive", title: "Signup Failed", description: errorMessage });
    } finally {
      setIsLoading(false);
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
              <CardDescription>Access your EzCare Simplified account.</CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">Email Address</Label>
                  <Input id="email-login" name="email-login" type="email" placeholder="Enter your email" required aria-label="Email address for login" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login">Password</Label>
                  <Input id="password-login" name="password-login" type="password" placeholder="Enter your password" required aria-label="Password for login" />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full btn-premium" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
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
                  <Input id="password-signup" name="password" type="password" placeholder="Create a password (min. 6 characters)" required aria-label="Password for signup" />
                </div>

                 <div className="space-y-2">
                  <Label htmlFor="profile-picture-signup" className="flex items-center">
                    <UploadCloud className="w-4 h-4 mr-2 opacity-70"/> Profile Picture (Optional)
                  </Label>
                  <Input id="profile-picture-signup" name="profilePicture" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} aria-label="Profile picture for signup" className="text-sm"/>
                  {profilePicturePreview && (
                    <div className="mt-2">
                      <Image src={profilePicturePreview} alt="Profile preview" width={80} height={80} className="rounded-full object-cover aspect-square" />
                    </div>
                  )}
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
                <Button type="submit" className="w-full btn-premium" disabled={isLoading}>
                  {isLoading ? 'Signing up...' : 'Sign Up'}
                </Button>
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
    
