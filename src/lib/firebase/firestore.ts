import { db } from './config';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { PatientProfile, DoctorProfile, UserProfile, Doctor } from '@/types';

/**
 * Checks for an existing user profile. If none exists, creates a default patient profile.
 * @param user - Firebase Auth user
 * @returns PatientProfile, DoctorProfile, or null
 */
export async function checkAndCreateUserProfile(user: User): Promise<PatientProfile | DoctorProfile | null> {
  if (!user) return null;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data() as UserProfile;

    if (userData.role === 'doctor') {
      return userData.isVerified ? (userData as DoctorProfile) : null;
    }

    return userData as PatientProfile;
  } else {
    // Default to creating a patient profile if user doesn't exist
    const newPatientProfile: PatientProfile = {
      uid: user.uid,
      email: user.email ?? '',
      displayName: user.displayName ?? '',
      createdAt: new Date().toISOString(),
      role: 'patient',
      // Add any additional default fields here
    };

    await setDoc(userRef, newPatientProfile);
    return newPatientProfile;
  }
}

/**
 * Updates the verification status of a doctor.
 * @param uid - Doctor's UID
 * @param isVerified - Verification status
 */
export async function updateDoctorVerificationStatus(uid: string, isVerified: boolean): Promise<void> {
  const doctorRef = doc(db, 'users', uid);
  await updateDoc(doctorRef, { isVerified });
}

/**
 * Adds a new patient profile.
 * @param patientData - Patient data excluding role and createdAt
 */
export async function addPatient(patientData: Omit<PatientProfile, 'createdAt' | 'role'>): Promise<void> {
  const patientRef = doc(db, 'users', patientData.uid);
  const newPatient: PatientProfile = {
    ...patientData,
    role: 'patient',
    createdAt: new Date().toISOString(),
  };

  await setDoc(patientRef, newPatient);
}

/**
 * Adds a new doctor profile.
 * @param doctorData - Doctor data excluding role and createdAt
 */
export async function addDoctor(doctorData: Omit<DoctorProfile, 'createdAt' | 'role'>): Promise<void> {
  const doctorRef = doc(db, 'users', doctorData.uid);
  const newDoctor: DoctorProfile = {
    ...doctorData,
    role: 'doctor',
    createdAt: new Date().toISOString(),
    isVerified: doctorData.isVerified ?? false, // Optional: default if not provided
  };

  await setDoc(doctorRef, newDoctor);
}

/**
 * Adds a new lab worker profile.
 * @param labWorkerData - Lab worker data excluding role and createdAt
 */
export async function addLabWorker(labWorkerData: Omit<UserProfile, 'createdAt' | 'role'>): Promise<void> {
  const labWorkerRef = doc(db, 'users', labWorkerData.uid);
  const newLabWorker: UserProfile = {
    ...labWorkerData,
    role: 'lab_worker',
    createdAt: new Date().toISOString(),
  };

  await setDoc(labWorkerRef, newLabWorker);
}

/**
 * Checks if a username is unique.
 * @param username - Username to check
 * @returns true if unique, false if taken
 */
export async function isUsernameUnique(username: string): Promise<boolean> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username));
  const querySnapshot = await getDocs(q);

  return querySnapshot.empty;
}

/**
 * Retrieves a user profile by UID.
 * @param uid - User UID
 * @returns UserProfile or null if not found
 */
export async function getUserProfileByUID(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  return userSnap.exists() ? (userSnap.data() as UserProfile) : null;
}

/**
 * Retrieves a list of all doctors.
 * @returns A promise that resolves to an array of Doctor objects.
 */
export async function getDoctors(): Promise<Doctor[]> {
    const doctors: Doctor[] = [];
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'doctor'));

    try {
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            // Here, we type cast the document data to Doctor.
            // You might want to add more robust validation in a real-world scenario.
            const doctorData = doc.data() as Doctor;
            doctors.push({
                ...doctorData,
                id: doc.id, // Assign the document ID to the doctor's id property
            });
        });
    } catch (error) {
        console.error("Error fetching doctors: ", error);
        // Depending on your error handling strategy, you might want to re-throw the error
        // or return an empty array.
    }
    
    return doctors;
}