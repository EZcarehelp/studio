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
  serverTimestamp,
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import type { PatientProfile, DoctorProfile, UserProfile, Doctor } from '@/types';


/**
 * Retrieves a user profile by UID. Returns null if not found.
 * @param uid - User UID
 */
export async function getUserProfileByUID(uid: string): Promise<UserProfile | DoctorProfile | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }
  return userSnap.data() as UserProfile | DoctorProfile;
}


/**
 * Checks for an existing user profile by UID. If none exists, creates a default patient profile.
 * This is crucial for Google Sign-In where users don't go through the detailed signup form.
 * @param user - Firebase Auth user object
 * @returns The existing or newly created user profile.
 */
export async function checkAndCreateUserProfile(user: FirebaseUser): Promise<UserProfile | DoctorProfile | null> {
  if (!user) return null;

  const existingProfile = await getUserProfileByUID(user.uid);
  if (existingProfile) {
    // If a doctor profile exists but isn't verified, you might want to handle that here
    // For now, we return the existing profile as is.
    return existingProfile;
  }

  // If no profile exists, create a default 'patient' profile.
  console.log(`No profile found for UID ${user.uid}. Creating new patient profile.`);
  const newPatientProfile: Omit<PatientProfile, 'createdAt' | 'role'> = {
    uid: user.uid,
    email: user.email || '',
    name: user.displayName || 'New User',
    username: user.email?.split('@')[0] || `user${Date.now()}`,
    phone: user.phoneNumber || '',
    avatarUrl: user.photoURL || undefined,
  };

  await addPatient(newPatientProfile);

  // Fetch the just-created profile to return it with all fields.
  return await getUserProfileByUID(user.uid);
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
 * Adds a new patient profile to Firestore.
 * @param patientData - Patient data excluding role and createdAt
 */
export async function addPatient(patientData: Omit<PatientProfile, 'createdAt' | 'role'>): Promise<void> {
  const patientRef = doc(db, 'users', patientData.uid);
  const newPatient: PatientProfile = {
    ...patientData,
    role: 'patient',
    createdAt: serverTimestamp(),
  };

  await setDoc(patientRef, newPatient);
}


/**
 * Adds a new doctor profile to Firestore.
 * @param doctorData - Doctor data excluding role and createdAt
 */
export async function addDoctor(doctorData: Omit<DoctorProfile, 'createdAt' | 'role' | 'id'>): Promise<void> {
  if (!doctorData.uid) throw new Error("UID is required to add a doctor.");
  const doctorRef = doc(db, 'users', doctorData.uid);
  const newDoctor: Omit<DoctorProfile, 'id'> = {
    ...doctorData,
    role: 'doctor',
    createdAt: serverTimestamp(),
    isVerified: doctorData.isVerified ?? false,
  };

  await setDoc(doctorRef, newDoctor);
}


/**
 * Adds a new lab worker profile to Firestore.
 * @param labWorkerData - Lab worker data excluding role and createdAt
 */
export async function addLabWorker(labWorkerData: Omit<UserProfile, 'createdAt' | 'role' | 'id'>): Promise<void> {
    if (!labWorkerData.uid) throw new Error("UID is required to add a lab worker.");
    const labWorkerRef = doc(db, 'users', labWorkerData.uid);
    const newLabWorker: Omit<UserProfile, 'id'> = {
        ...labWorkerData,
        role: 'lab_worker',
        createdAt: serverTimestamp(),
    };
    await setDoc(labWorkerRef, newLabWorker);
}


/**
 * Checks if a username is unique across the 'users' collection.
 * @param username - Username to check
 * @returns true if unique, false if taken
 */
export async function isUsernameUnique(username: string): Promise<boolean> {
  if (!username) return false;
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username.toLowerCase()));
  const querySnapshot = await getDocs(q);

  return querySnapshot.empty;
}


/**
 * Retrieves a list of all doctors from Firestore.
 * @returns A promise that resolves to an array of Doctor objects.
 */
export async function getDoctors(): Promise<Doctor[]> {
    const doctors: Doctor[] = [];
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'doctor'));

    try {
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnap) => {
            const doctorData = docSnap.data() as Omit<Doctor, 'id'>;
            doctors.push({
                ...doctorData,
                id: docSnap.id,
            });
        });
    } catch (error) {
        console.error("Error fetching doctors: ", error);
    }
    
    return doctors;
}

/**
 * Retrieves a user profile by their username.
 * @param username The user's username.
 * @returns A promise that resolves to the user's profile or null if not found.
 */
export async function getUserByUsername(username: string): Promise<(UserProfile | Doctor) | null> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Add roleActual for consistency
    let roleActual = userData.role;
    if (userData.role === 'doctor' && 'specialty' in userData) {
        roleActual = 'doctor';
    }

    return {
        ...userData,
        id: userDoc.id,
        roleActual,
    } as UserProfile | Doctor;
}
