"use client";

import { useEffect, useState, startTransition } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getUserProfileByUID, checkAndCreateUserProfile } from '@/lib/firebase/firestore';
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
  isAdminSession: boolean;
}

export function useAuthState(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    authUser: null,
    userProfile: null,
    isLoading: true,
    isAdminSession: false,
  });

  useEffect(() => {
    // Check for admin session on mount
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('isAdminLoggedIn') === 'true') {
        setAuthState({
          authUser: { uid: 'admin_uid_mock' } as FirebaseUser,
          userProfile: {
            id: 'admin_profile_mock',
            name: 'Admin User',
            email: 'ezcarehelp@gmail.com',
            role: 'admin',
            roleActual: 'admin',
            phone: 'N/A'
          },
          isLoading: false,
          isAdminSession: true,
        });
        return; // Early return for admin
      }
    }
    
    // Standard Firebase auth listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await checkAndCreateUserProfile(user);
          if (profile) {
             let roleActual = profile.role;
             if (!roleActual && 'specialty' in profile) {
                 roleActual = 'doctor';
             }
             let mockLat, mockLon;
             if (roleActual === 'patient' && !(profile as UserProfile).latitude) {
                 mockLat = 13.0827; // Chennai default
                 mockLon = 80.2707;
             }
             
            startTransition(() => {
                setAuthState({
                    authUser: user,
                    userProfile: { 
                        ...profile, 
                        roleActual: roleActual as UserProfile['role'] | 'doctor',
                        latitude: mockLat ?? (profile as UserProfile).latitude,
                        longitude: mockLon ?? (profile as UserProfile).longitude
                    },
                    isLoading: false,
                    isAdminSession: false,
                });
            });

          } else { // Profile might be pending verification
             startTransition(() => {
                setAuthState({ authUser: user, userProfile: null, isLoading: false, isAdminSession: false });
             });
          }
        } catch (error) {
          console.error("Error fetching/creating user profile:", error);
          startTransition(() => {
            setAuthState({ authUser: user, userProfile: null, isLoading: false, isAdminSession: false });
          });
        }
      } else {
        // User is signed out
        if (typeof window !== 'undefined') {
          localStorage.removeItem('isAdminLoggedIn');
        }
        startTransition(() => {
            setAuthState({ authUser: null, userProfile: null, isLoading: false, isAdminSession: false });
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return authState;
}
