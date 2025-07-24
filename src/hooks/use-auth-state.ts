
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
    const checkAdminSession = () => {
      if (typeof window !== 'undefined' && localStorage.getItem('isAdminLoggedIn') === 'true') {
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
        return true; // Admin session found
      }
      return false; // No admin session
    };

    if (checkAdminSession()) {
      return; // Early return if we are in an admin session
    }
    
    // Standard Firebase auth listener for non-admin users
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in.
        try {
          const profile = await checkAndCreateUserProfile(user);
          if (profile) {
            let roleActual = profile.role;
            if ('specialty' in profile) {
                roleActual = 'doctor';
            }

            setAuthState({
              authUser: user,
              userProfile: { 
                ...profile, 
                roleActual: roleActual as UserProfile['role'] | 'doctor',
              },
              isLoading: false,
              isAdminSession: false,
            });
          } else {
            // Profile exists but might be pending verification, or there's an issue.
            // For now, treat as authenticated but without a full profile.
            setAuthState({ authUser: user, userProfile: null, isLoading: false, isAdminSession: false });
          }
        } catch (error) {
          console.error("Error in onAuthStateChanged profile handling:", error);
          setAuthState({ authUser: user, userProfile: null, isLoading: false, isAdminSession: false });
        }
      } else {
        // User is signed out
        if (typeof window !== 'undefined') {
          localStorage.removeItem('isAdminLoggedIn');
        }
        setAuthState({ authUser: null, userProfile: null, isLoading: false, isAdminSession: false });
      }
    });

    return () => unsubscribe();
  }, []);

  return authState;
}
