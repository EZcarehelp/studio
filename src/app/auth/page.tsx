
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserPlus, LogIn, UploadCloud, Loader2, KeyRound } from "lucide-react"; 
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useRef, type ChangeEvent, type FormEvent, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { addDoctor, addPatient, addLabWorker, isUsernameUnique, getUserProfileByUID, checkAndCreateUserProfile } from '@/lib/firebase/firestore'; 
import type { Doctor, UserProfile } from '@/types';
import { uploadFileToStorage } from '@/lib/firebase/storage';
import { auth } from '@/lib/firebase/config';
import { signInWithGoogle, sendPasswordResetEmail } from '@/lib/firebase/auth';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  type AuthError
} from "firebase/auth";
import { useAuthState } from '@/hooks/use-auth-state';

const ADMIN_EMAIL = "ezcarehelp@gmail.com";
const ADMIN_PASSWORD = "VARUNARUN"; 

const GoogleIcon = () => (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.3v2.84C4.01 20.48 7.72 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.3C1.42 8.84 1 10.42 1 12s.42 3.16 1.2 4.93l3.54-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.72 1 4.01 3.52 2.3 6.96l3.54 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);


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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  const { authUser, isLoading: authIsLoading, userProfile } = useAuthState();

  const handleSuccessfulLogin = (role: UserProfile['role'] | 'doctor' | null) => {
    if (role === 'admin') router.push('/admin/dashboard');
    else if (role === 'doctor') router.push('/doctor/dashboard');
    else if (role === 'lab_worker') router.push('/lab/dashboard');
    else if (role === 'patient') router.push('/patient/dashboard');
    else router.push('/'); // Fallback
  };

  useEffect(() => {
    if (!authIsLoading && authUser) {
      handleSuccessfulLogin(userProfile?.roleActual || null);
    }
  }, [authUser, authIsLoading, userProfile, router]);


  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const emailValue = (event.currentTarget.elements.namedItem('email-login') as HTMLInputElement).value;
    const passwordValue = (event.currentTarget.elements.namedItem('password-login') as HTMLInputElement).value;

    if (emailValue === ADMIN_EMAIL && passwordValue === ADMIN_PASSWORD) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('isAdminLoggedIn', 'true');
      }
      toast({ title: "Admin Login Successful", description: "Redirecting...", variant: "success" });
      handleSuccessfulLogin('admin');
      setIsLoading(false);
      return;
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, emailValue, passwordValue);
      const fetchedProfile = await getUserProfileByUID(userCredential.user.uid);
      if (fetchedProfile) {
        toast({ title: "Login Successful", description: "Redirecting...", variant: "success" });
        handleSuccessfulLogin(fetchedProfile.roleActual || null);
      } else {
        toast({ variant: "destructive", title: "Login Error", description: "User profile not found." });
        await auth.signOut();
      }
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "Failed to login. Please check your credentials.";
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password.";
      }
      toast({ variant: "destructive", title: "Login Failed", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        // This function now checks if a profile exists, and if not, creates a patient profile.
        const profile = await checkAndCreateUserProfile(user);
        toast({ title: "Login Successful", description: "Welcome to EzCare Simplified!", variant: "success" });
        handleSuccessfulLogin(profile.roleActual || 'patient');
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      toast({ variant: "destructive", title: "Google Sign-In Failed", description: "Could not sign in with Google. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };


  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({ variant: "destructive", title: "Email Required", description: "Please enter your email address." });
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(resetEmail);
      toast({ title: "Password Reset Email Sent", description: "Check your inbox for a password reset link.", variant: "success" });
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "Could not send password reset email.";
      if (authError.code === 'auth/user-not-found') errorMessage = "No user found with this email.";
      toast({ variant: "destructive", title: "Password Reset Failed", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { 
        toast({ variant: "destructive", title: "File too large", description: "Profile picture must be smaller than 5MB." });
        if(fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setProfilePictureFile(file);
      setProfilePicturePreview(URL.createObjectURL(file));
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
      toast({ variant: "destructive", title: "Registration Restricted", description: "This email is reserved." });
      setIsLoading(false);
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9._]{3,30}$/;
    if (!username || !usernameRegex.test(username)) {
      toast({ variant: "destructive", title: "Invalid Username", description: "3-30 chars, letters, numbers, '.', '_' only." });
      setIsLoading(false); return;
    }

    const isUnique = await isUsernameUnique(username.toLowerCase());
    if (!isUnique) {
      toast({ variant: "destructive", title: "Username Taken" });
      setIsLoading(false); return;
    }
    
    const finalUsername = username.toLowerCase(); 
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const uid = firebaseUser.uid;

      let avatarUrlFromStorage: string | undefined = undefined;
      if (profilePictureFile) {
        avatarUrlFromStorage = await uploadFileToStorage(profilePictureFile, `profilePictures/${uid}`, profilePictureFile.name);
      }

      if (userType === 'doctor') {
        const specialty = formData.get('specialization') as string;
        const experience = parseInt(formData.get('experience') as string, 10);
        const licenseNumber = formData.get('licenseNumber') as string;
        await addDoctor({ uid, name, username: finalUsername, email, phone, specialty, experience, licenseNumber, location: locationInput, imageUrl: avatarUrlFromStorage });
      } else if (userType === 'lab_worker') {
        const labAffiliation = formData.get('labId') as string; 
        await addLabWorker({ uid, name, username: finalUsername, email, phone, location: locationInput, labAffiliation, avatarUrl: avatarUrlFromStorage });
      } else { 
        await addPatient({ uid, name, username: finalUsername, email, phone, location: locationInput, avatarUrl: avatarUrlFromStorage });
      }
      toast({ title: "Sign Up Successful", description: "Redirecting...", variant: "success" });
      handleSuccessfulLogin(userType);

    } catch (error) {
        const authError = error as AuthError;
        let errorMessage = "Could not create account.";
        if (authError.code === 'auth/email-already-in-use') errorMessage = "Email already registered. Please login.";
        else if (authError.code === 'auth/weak-password') errorMessage = "Password is too weak (min. 6 characters).";
        toast({ variant: "destructive", title: "Signup Failed", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (authIsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
         <Image src="/logo.svg" alt="EzCare Simplified Logo" width={180} height={63} priority />
      </Link>
      <Tabs defaultValue={initialTab} className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login" onClick={() => setShowForgotPassword(false)}><LogIn className="mr-2 h-4 w-4" />Login</TabsTrigger>
          <TabsTrigger value="signup" onClick={() => setShowForgotPassword(false)}><UserPlus className="mr-2 h-4 w-4" />Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{showForgotPassword ? 'Reset Password' : 'Login'}</CardTitle>
              <CardDescription>
                {showForgotPassword 
                  ? 'Enter your email to receive a password reset link.' 
                  : 'Access your EzCare Simplified account.'}
              </CardDescription>
            </CardHeader>
            {!showForgotPassword ? (
              <>
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-login">Email Address</Label>
                      <Input id="email-login" name="email-login" type="email" placeholder="Enter your email" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-login">Password</Label>
                      <Input id="password-login" name="password-login" type="password" placeholder="Enter your password" required />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full btn-premium" disabled={isLoading}>
                      {isLoading ? <Loader2 className="animate-spin"/> : 'Login'}
                    </Button>
                  </CardFooter>
                </form>
                 <div className="px-6 pb-6 text-center text-sm">
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t"/></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin"/> : <><GoogleIcon/> Google</>}
                    </Button>
                    <Button variant="link" type="button" onClick={() => setShowForgotPassword(true)} className="text-sm text-primary hover:underline mt-4">
                        Forgot Password?
                    </Button>
                 </div>
              </>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handlePasswordReset(); }}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-reset">Email Address</Label>
                    <Input 
                      id="email-reset" 
                      name="email-reset" 
                      type="email" 
                      placeholder="Enter your registered email" 
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required 
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full btn-premium" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin"/> : <><KeyRound className="mr-2 h-4 w-4"/>Send Reset Link</>}
                  </Button>
                  <Button variant="link" type="button" onClick={() => setShowForgotPassword(false)} className="text-sm text-primary hover:underline">
                    Back to Login
                  </Button>
                </CardFooter>
              </form>
            )}
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
                  >
                    <div className="flex items-center space-x-2"><RadioGroupItem value="patient" id="patient" /><Label htmlFor="patient">Patient</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="doctor" id="doctor" /><Label htmlFor="doctor">Doctor</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="lab_worker" id="lab_worker" /><Label htmlFor="lab_worker">Lab Worker</Label></div>
                  </RadioGroup>
                </div>
                <div className="space-y-2"><Label htmlFor="fullName-signup">Full Name</Label><Input id="fullName-signup" name="fullName" placeholder="Full name" required /></div>
                <div className="space-y-2"><Label htmlFor="username-signup">Username</Label><Input id="username-signup" name="username" placeholder="e.g., ezcare_user" required /><p className="text-xs text-muted-foreground">3-30 chars. Letters, numbers, '.', '_' only.</p></div>
                <div className="space-y-2"><Label htmlFor="email-signup">Email Address</Label><Input id="email-signup" name="email-signup" type="email" placeholder="Email address" required /></div>
                <div className="space-y-2"><Label htmlFor="phone-signup">Phone Number</Label><Input id="phone-signup" name="phone" type="tel" placeholder="Phone number" required /></div>
                <div className="space-y-2"><Label htmlFor="password-signup">Password</Label><Input id="password-signup" name="password" type="password" placeholder="Min. 6 characters" required /></div>
                <div className="space-y-2">
                  <Label htmlFor="profile-picture-signup" className="flex items-center"><UploadCloud className="w-4 h-4 mr-2 opacity-70"/> Profile Picture (Optional)</Label>
                  <Input id="profile-picture-signup" name="profilePicture" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="text-sm"/>
                  {profilePicturePreview && <div className="mt-2"><Image src={profilePicturePreview} alt="Profile preview" width={80} height={80} className="rounded-full object-cover aspect-square" /></div>}
                </div>
                {(userType === 'doctor' || userType === 'lab_worker' || userType === 'patient') && (<div className="space-y-2"><Label htmlFor="location-common">Location (City, State)</Label><Input id="location-common" name="location" placeholder="e.g., New York, NY" required /></div>)}
                {userType === 'doctor' && (<>
                  <div className="space-y-2"><Label htmlFor="licenseNumber-signup">License Number</Label><Input id="licenseNumber-signup" name="licenseNumber" placeholder="Medical license number" required /></div>
                  <div className="space-y-2"><Label htmlFor="specialization-signup">Specialization</Label><Input id="specialization-signup" name="specialization" placeholder="e.g., Cardiologist" required /></div>
                  <div className="space-y-2"><Label htmlFor="experience-signup">Years of Experience</Label><Input id="experience-signup" name="experience" type="number" placeholder="e.g., 5" required min="0"/></div>
                  <p className="text-xs text-muted-foreground">Profile approval pending by admin.</p>
                </>)}
                {userType === 'lab_worker' && (<>
                  <div className="space-y-2"><Label htmlFor="labId-signup">Laboratory ID / Affiliation</Label><Input id="labId-signup" name="labId" placeholder="Lab ID or affiliation" required /></div>
                  <p className="text-xs text-muted-foreground">Account approval pending.</p>
                </>)}
                <div className="flex items-center space-x-2"><Checkbox id="terms-signup" name="terms" required /><Label htmlFor="terms-signup" className="text-sm font-normal">I agree to the <Link href="/terms" className="underline text-primary">Terms and Conditions</Link></Label></div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full btn-premium" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin"/> : 'Sign Up'}
                </Button>
                <div className="relative w-full my-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t"/></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or sign up with</span></div>
                </div>
                 <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin"/> : <><GoogleIcon/> Google</>}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
