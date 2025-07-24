
import { db } from './config'; 
import { collection, addDoc, getDocs, serverTimestamp, query, where, type DocumentData, type QuerySnapshot, doc, setDoc, getDoc, documentId } from 'firebase/firestore';
import type { Doctor, UserProfile } from '@/types';
import type { User as FirebaseUser } from 'firebase/auth';

// Add a doctor to Firestore
export async function addDoctor(
  doctorData: Omit<Doctor, 'id' | 'rating' | 'availability' | 'isVerified' | 'dataAiHint' | 'createdAt'> & 
              Partial<Pick<Doctor, 'rating' | 'availability' | 'isVerified' | 'dataAiHint' | 'imageUrl'>>
): Promise<Doctor> {
  try {
    const docDataWithTimestamp = {
      ...doctorData, // uid is now part of doctorData
      username: doctorData.username?.toLowerCase(), 
      rating: doctorData.rating || parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
      availability: doctorData.availability || (Math.random() > 0.5 ? "Available Today" : "Next 3 days"),
      imageUrl: doctorData.imageUrl || "https://placehold.co/400x250.png",
      isVerified: doctorData.isVerified === undefined ? false : doctorData.isVerified,
      dataAiHint: doctorData.dataAiHint || "doctor portrait",
      role: 'doctor',
      createdAt: serverTimestamp(),
    };
    const docRef = doc(db, "doctors", doctorData.uid); // Use UID as document ID
    await setDoc(docRef, docDataWithTimestamp);
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
               { avatarUrl?: string; }
): Promise<UserProfile> {
  try {
    const patientDataWithTimestamp = {
      ...patientData, // uid is now part of patientData
      username: patientData.username?.toLowerCase(), 
      role: 'patient' as const,
      avatarUrl: patientData.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${patientData.name}`,
      createdAt: serverTimestamp(),
    };
    const docRef = doc(db, "patients", patientData.uid); // Use UID as document ID
    await setDoc(docRef, patientDataWithTimestamp);
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
                 { labAffiliation: string; avatarUrl?: string; }
): Promise<UserProfile> {
  try {
    const labWorkerDataWithTimestamp = {
      ...labWorkerData,
      username: labWorkerData.username?.toLowerCase(), 
      role: 'lab_worker' as const,
      avatarUrl: labWorkerData.avatarUrl || "https://placehold.co/200x200.png",
      createdAt: serverTimestamp(),
    };
    const docRef = doc(db, "lab_workers", labWorkerData.uid); // Use UID as document ID
    await setDoc(docRef, labWorkerDataWithTimestamp);
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
      
      let roleActual = (userData as UserProfile).role;
      if (!roleActual && collectionName === 'doctors') roleActual = 'doctor';
      
      return { ...userData, roleActual } as (UserProfile | Doctor) & { roleActual?: UserProfile['role'] | 'doctor' };
    }
  }
  return null; 
}
    
// Get user profile by UID from Firestore (searches patients, doctors, lab_workers)
export async function getUserProfileByUID(uid: string): Promise<UserProfile | Doctor | null> {
  if (!uid) return null;

  const collectionsToSearch = ['patients', 'doctors', 'lab_workers'];
  for (const collectionName of collectionsToSearch) {
    const docRef = doc(db, collectionName, uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      let data = { id: docSnap.id, ...docSnap.data() };
       if (collectionName === 'doctors' && !data.role) {
        data.role = 'doctor';
      }
      return data as UserProfile | Doctor;
    }
  }
  console.warn(`No profile found for UID: ${uid} in any collection.`);
  return null;
}

// On Google Sign-in, check if user exists, if not create a patient profile
export async function checkAndCreateUserProfile(user: FirebaseUser): Promise<(UserProfile | Doctor) & { roleActual?: UserProfile['role'] | 'doctor' }> {
  const existingProfile = await getUserProfileByUID(user.uid);
  if (existingProfile) {
    return { ...existingProfile, roleActual: existingProfile.role };
  }

  // User does not exist, create a new patient profile
  console.log(`Creating new patient profile for Google user: ${user.displayName}`);
  const username = user.email ? user.email.split('@')[0] : `user${user.uid.substring(0, 5)}`;
  const uniqueUsername = await isUsernameUnique(username) ? username : `${username}_${user.uid.substring(0, 4)}`;
  
  const newPatientProfile: UserProfile = {
    uid: user.uid,
    name: user.displayName || 'New User',
    email: user.email || '',
    phone: user.phoneNumber || '',
    username: uniqueUsername,
    avatarUrl: user.photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${user.displayName || 'User'}`,
    role: 'patient',
  };

  await addPatient(newPatientProfile);

  return { ...newPatientProfile, id: user.uid, roleActual: 'patient' };
}
