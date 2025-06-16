
"use client";

import { useEffect, useState } from 'react';
import { useParams }    from 'next/navigation';
import { getUserByUsername } from '@/lib/firebase/firestore';
import type { UserProfile, Doctor } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, UserCircle, ShieldCheck, Briefcase, MapPin, Mail, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Added Button for homepage link

// Helper type for the combined user data with a clear role
type CombinedUserType = (UserProfile | Doctor) & { roleActual: UserProfile['role'] | 'doctor' };

export default function UserProfilePage() {
  const params = useParams();
  const usernameFromUrl = params.username as string;
  const [user, setUser] = useState<CombinedUserType | null | undefined>(undefined); // undefined for loading, null for not found
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (usernameFromUrl) {
      const fetchUser = async () => {
        setUser(undefined); 
        setError(null);
        try {
          const fetchedUser = await getUserByUsername(usernameFromUrl.toLowerCase()); 
          if (fetchedUser) {
            setUser(fetchedUser as CombinedUserType); 
          } else {
            setUser(null); 
          }
        } catch (err) {
          console.error("Error fetching user by username:", err);
          setError("Failed to load profile. Please try again later.");
          setUser(null);
        }
      };
      fetchUser();
    }
  }, [usernameFromUrl]);

  if (user === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading profile for @{usernameFromUrl}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center p-4">
         <UserCircle className="h-20 w-20 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold text-destructive">Error Loading Profile</h1>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button asChild variant="link" className="mt-6">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center p-4">
        <UserCircle className="h-20 w-20 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold">User Not Found</h1>
        <p className="text-muted-foreground mt-2">The profile for <span className="font-medium text-primary">@{usernameFromUrl}</span> could not be found.</p>
        <Button asChild variant="link" className="mt-6">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }
  
  const isDoctorProfile = user.roleActual === 'doctor' && 'specialty' in user;
  const doctorProfile = isDoctorProfile ? (user as Doctor) : null;
  const userProfile = user as UserProfile; 

  const avatarSource = userProfile.avatarUrl || doctorProfile?.imageUrl || `https://placehold.co/200x200.png?text=${userProfile.username?.substring(0,2).toUpperCase()}`;
  const avatarDataAiHint = userProfile.roleActual === 'doctor' ? 'doctor avatar' : userProfile.roleActual === 'lab_worker' ? 'lab worker avatar' : 'user avatar';


  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden transform transition-all hover:scale-[1.01] duration-300">
        <CardHeader className="bg-gradient-to-br from-primary via-primary/90 to-secondary p-8 text-primary-foreground relative">
          <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
              <AvatarImage 
                src={avatarSource} 
                alt={userProfile.name} 
                data-ai-hint={avatarDataAiHint}
              />
              <AvatarFallback className="text-4xl bg-black/20">{userProfile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left flex-grow">
              <CardTitle className="text-3xl md:text-4xl font-bold">{userProfile.name}</CardTitle>
              {userProfile.username && 
                <CardDescription className="text-primary-foreground/80 text-lg mt-1">@{userProfile.username}</CardDescription>
              }
               <Badge variant="secondary" className="mt-2 capitalize bg-background/20 text-primary-foreground border-primary-foreground/30 text-xs px-2 py-1">
                {userProfile.roleActual?.replace('_', ' ') || 'User'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          {userProfile.email && (
             <div className="flex items-start">
                <Mail className="w-5 h-5 mr-3 mt-1 text-muted-foreground flex-shrink-0"/>
                <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</h3>
                    <p className="text-foreground text-sm sm:text-base">{userProfile.email}</p>
                </div>
            </div>
          )}
          {userProfile.phone && (
             <div className="flex items-start">
                <Phone className="w-5 h-5 mr-3 mt-1 text-muted-foreground flex-shrink-0"/>
                <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</h3>
                    <p className="text-foreground text-sm sm:text-base">{userProfile.phone}</p>
                </div>
            </div>
          )}
          {userProfile.location && (
             <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 mt-1 text-muted-foreground flex-shrink-0"/>
                <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</h3>
                    <p className="text-foreground text-sm sm:text-base">{userProfile.location}</p>
                </div>
            </div>
          )}

          {doctorProfile && (
            <>
              <div className="pt-4 border-t">
                 <div className="flex items-start">
                     <Briefcase className="w-5 h-5 mr-3 mt-1 text-muted-foreground flex-shrink-0"/>
                    <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Specialty</h3>
                        <p className="text-foreground text-sm sm:text-base">{doctorProfile.specialty}</p>
                    </div>
                </div>
              </div>
              {doctorProfile.experience !== undefined && ( 
                <div className="flex items-start">
                     <ShieldCheck className="w-5 h-5 mr-3 mt-1 text-muted-foreground flex-shrink-0"/>
                    <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Experience</h3>
                        <p className="text-foreground text-sm sm:text-base">{doctorProfile.experience} years</p>
                    </div>
                </div>
              )}
               {doctorProfile.isVerified && (
                 <Badge className="bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300 px-2.5 py-1">
                   <ShieldCheck className="w-4 h-4 mr-1.5" /> Verified Professional
                 </Badge>
               )}
               {doctorProfile.consultationFee && (
                  <div className="flex items-start">
                     <span className="text-2xl mr-2 mt-0 text-muted-foreground">₹</span>
                    <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Consultation Fee</h3>
                        <p className="text-foreground text-sm sm:text-base">{doctorProfile.consultationFee}</p>
                    </div>
                </div>
               )}
            </>
          )}
          
          {userProfile.roleActual === 'lab_worker' && userProfile.labAffiliation && (
            <div className="pt-4 border-t">
              <div className="flex items-start">
                <Briefcase className="w-5 h-5 mr-3 mt-1 text-muted-foreground flex-shrink-0"/>
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lab Affiliation</h3>
                  <p className="text-foreground text-sm sm:text-base">{userProfile.labAffiliation}</p>
                </div>
              </div>
            </div>
          )}
          
          <CardFooter className="pt-4 border-t text-center">
            <p className="text-xs text-muted-foreground mx-auto">
                This is a basic profile view. More details can be added as the platform evolves.
            </p>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
}
    