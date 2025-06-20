
"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getUserProfileByUID } from '@/lib/firebase/firestore';
import type { UserProfile, Doctor } from '@/types';

type AppUserProfile = (UserProfile | Doctor) & { 
    roleActual?: UserProfile['role'] | 'doctor';
    latitude?: number;
    longitude?: number; 
};

interface AuthState {
  authUser: FirebaseUser | null;
  userProfile: AppUserProfile | null;
  isLoading: boolean;
  isAdminSession: boolean; // To track the hardcoded admin login
}

export function useAuthState(): AuthState {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<AppUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminSession, setIsAdminSession] = useState(false);

  useEffect(() => {
    // Check for hardcoded admin session from localStorage
    if (typeof window !== 'undefined') {
        const adminLoggedIn = localStorage.getItem('isAdminLoggedIn');
        if (adminLoggedIn === 'true') {
            // For admin, create a mock FirebaseUser and a basic admin profile
            const mockAdminFirebaseUser: Partial<FirebaseUser> = { uid: 'admin_uid_mock', email: 'ezcarehelp@gmail.com' };
            const mockAdminProfile: AppUserProfile = { 
                id: 'admin_profile_mock',
                name: 'Admin User', 
                email: 'ezcarehelp@gmail.com', 
                role: 'admin', 
                roleActual: 'admin',
                phone: 'N/A' // Add required field
            };
            setAuthUser(mockAdminFirebaseUser as FirebaseUser);
            setUserProfile(mockAdminProfile);
            setIsAdminSession(true);
            setIsLoading(false);
            return; // Skip Firebase auth listener if admin session active
        }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
        setAuthUser(user);
        try {
          const profile = await getUserProfileByUID(user.uid);
          if (profile) {
            let roleActual = profile.role;
            if (!roleActual && 'specialty' in profile) { // Doctor specific check
                roleActual = 'doctor';
            }
            // Add mock location for patient for demo purposes if not present
            let mockLat: number | undefined = (profile as UserProfile).latitude;
            let mockLon: number | undefined = (profile as UserProfile).longitude;
            if (roleActual === 'patient' && (mockLat === undefined || mockLon === undefined)) {
                mockLat = 13.0827; // Chennai default
                mockLon = 80.2707;
                 console.log("Applied mock location for patient profile for climate feature demo.");
            }

            setUserProfile({ 
                ...profile, 
                roleActual: roleActual as UserProfile['role'] | 'doctor',
                latitude: mockLat, // Include possibly mocked lat/lon
                longitude: mockLon
            });
          } else {
            console.warn(`No Firestore profile found for UID: ${user.uid}. User might need to complete sign-up or data is missing.`);
            setUserProfile(null);
            // Consider signing out the user from Firebase Auth if profile is crucial:
            // await auth.signOut(); 
            // setAuthUser(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
        }
      } else {
        setAuthUser(null);
        setUserProfile(null);
        setIsAdminSession(false); 
        if (typeof window !== 'undefined') {
            localStorage.removeItem('isAdminLoggedIn');
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { authUser, userProfile, isLoading, isAdminSession };
}
