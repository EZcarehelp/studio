
import { db } from './config'; 
import { collection, addDoc, getDocs, serverTimestamp, query, where, type DocumentData, type QuerySnapshot } from 'firebase/firestore';
import type { Doctor, UserProfile } from '@/types';

// Add a doctor to Firestore
export async function addDoctor(
  doctorData: Omit<Doctor, 'id' | 'rating' | 'availability' | 'isVerified' | 'dataAiHint' | 'createdAt'> & 
              Partial<Pick<Doctor, 'rating' | 'availability' | 'isVerified' | 'dataAiHint' | 'imageUrl'>> &
              { username: string } 
): Promise<Doctor> {
  try {
    const docDataWithTimestamp = {
      ...doctorData,
      username: doctorData.username.toLowerCase(), 
      rating: doctorData.rating || parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)), // Ensure rating is a number
      availability: doctorData.availability || (Math.random() > 0.5 ? "Available Today" : "Next 3 days"),
      imageUrl: doctorData.imageUrl || "https://placehold.co/400x250.png", // Use provided or default
      isVerified: doctorData.isVerified === undefined ? true : doctorData.isVerified,
      dataAiHint: doctorData.dataAiHint || "doctor portrait",
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "doctors"), docDataWithTimestamp);
    console.log("Doctor added to Firestore with ID: ", docRef.id);
    return { id: docRef.id, ...docDataWithTimestamp } as Doctor;
  } catch (error) {
    console.error("Error adding doctor to Firestore: ", error);
    throw error;
  }
}

// Get all doctors from Firestore
export async function getDoctors(): Promise<Doctor[]> {
  try {
    const doctorsCollection = collection(db, "doctors");
    const doctorsSnapshot: QuerySnapshot<DocumentData> = await getDocs(doctorsCollection);
    const doctorsList: Doctor[] = doctorsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Doctor));
    console.log("Fetched doctors from Firestore: ", doctorsList.length);
    return doctorsList;
  } catch (error) {
    console.error("Error fetching doctors from Firestore: ", error);
    return [];
  }
}

// Add a patient to Firestore
export async function addPatient(
  patientData: Omit<UserProfile, 'id' | 'medicalHistory' | 'savedAddresses' | 'paymentMethods' | 'doctorDetails' | 'labAffiliation' | 'role' | 'createdAt'> &
               { username: string; avatarUrl?: string; } 
): Promise<UserProfile> {
  try {
    const patientDataWithTimestamp = {
      ...patientData,
      username: patientData.username.toLowerCase(), 
      role: 'patient' as const,
      avatarUrl: patientData.avatarUrl || "https://placehold.co/200x200.png", // Use provided or default
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "patients"), patientDataWithTimestamp);
    console.log("Patient added to Firestore with ID: ", docRef.id);
    return { id: docRef.id, ...patientDataWithTimestamp } as UserProfile;
  } catch (error) {
    console.error("Error adding patient to Firestore: ", error);
    throw error;
  }
}

// Add a lab worker to Firestore
export async function addLabWorker(
  labWorkerData: Omit<UserProfile, 'id' | 'medicalHistory' | 'savedAddresses' | 'paymentMethods' | 'doctorDetails' | 'role' | 'createdAt'> &
                 { labAffiliation: string; username: string; avatarUrl?: string; } 
): Promise<UserProfile> {
  try {
    const labWorkerDataWithTimestamp = {
      name: labWorkerData.name,
      phone: labWorkerData.phone,
      email: labWorkerData.email,
      username: labWorkerData.username.toLowerCase(), 
      role: 'lab_worker' as const,
      location: labWorkerData.location,
      labAffiliation: labWorkerData.labAffiliation,
      avatarUrl: labWorkerData.avatarUrl || "https://placehold.co/200x200.png", // Use provided or default
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "lab_workers"), labWorkerDataWithTimestamp);
    console.log("Lab worker added to Firestore with ID: ", docRef.id);
    return { id: docRef.id, ...labWorkerDataWithTimestamp } as UserProfile;
  } catch (error) {
    console.error("Error adding lab worker to Firestore: ", error);
    throw error;
  }
}

// Check if a username is unique across specified collections
export async function isUsernameUnique(username: string): Promise<boolean> {
  if (!username) return false;
  const lowerUsername = username.toLowerCase();

  const collectionsToSearch = ['doctors', 'patients', 'lab_workers'];
  for (const collectionName of collectionsToSearch) {
    const q = query(collection(db, collectionName), where("username", "==", lowerUsername));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return false; 
    }
  }
  return true; 
}

// Get user by username from specified collections
export async function getUserByUsername(username: string): Promise<(UserProfile | Doctor) & { roleActual?: UserProfile['role'] | 'doctor' } | null> {
  if (!username) return null;
  const lowerUsername = username.toLowerCase();

  const collectionsToSearch: { name: string, role: UserProfile['role'] | 'doctor' }[] = [
    { name: 'doctors', role: 'doctor' },
    { name: 'patients', role: 'patient' },
    { name: 'lab_workers', role: 'lab_worker' }
  ];

  for (const { name: collectionName, role } of collectionsToSearch) {
    const q = query(collection(db, collectionName), where("username", "==", lowerUsername));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const userData = { id: doc.id, ...doc.data() };
      
      let roleActual: UserProfile['role'] | 'doctor' = (userData as UserProfile).role;
      if (!roleActual && collectionName === 'doctors') {
        roleActual = 'doctor';
      } else if (!roleActual && collectionName === 'patients') {
        roleActual = 'patient';
      } else if (!roleActual && collectionName === 'lab_workers') {
        roleActual = 'lab_worker';
      }
      
      return { ...userData, roleActual } as (UserProfile | Doctor) & { roleActual?: UserProfile['role'] | 'doctor' };
    }
  }
  return null; 
}
    