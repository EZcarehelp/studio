
"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getUserProfileByUID } from '@/lib/firebase/firestore';
import type { UserProfile, Doctor } from '@/types';

type AppUserProfile = (UserProfile | Doctor) & { roleActual?: UserProfile['role'] | 'doctor' };

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
    // Check for hardcoded admin session from localStorage (this is a mock, not secure)
    if (typeof window !== 'undefined') {
        const adminLoggedIn = localStorage.getItem('isAdminLoggedIn');
        if (adminLoggedIn === 'true') {
            setAuthUser({ uid: 'admin_uid_mock' } as FirebaseUser); // Mock FirebaseUser for admin
            setUserProfile({ name: 'Admin', role: 'admin', roleActual: 'admin' } as AppUserProfile);
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
            // Ensure roleActual is set for doctors if 'role' field is missing
            let roleActual = profile.role;
            if (!roleActual && 'specialty' in profile) { // Heuristic for doctor
                roleActual = 'doctor';
            }
            setUserProfile({ ...profile, roleActual: roleActual as UserProfile['role'] | 'doctor' });
          } else {
            // This case means user exists in Firebase Auth but not in Firestore.
            // Could be a partially completed signup or data issue.
            console.warn(`No Firestore profile found for UID: ${user.uid}. Signing out.`);
            setUserProfile(null);
            // Optionally sign them out from Firebase Auth too:
            // await auth.signOut(); 
            // setAuthUser(null); // If signing out
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
        }
      } else {
        setAuthUser(null);
        setUserProfile(null);
        setIsAdminSession(false); // Clear admin session if Firebase user logs out
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
