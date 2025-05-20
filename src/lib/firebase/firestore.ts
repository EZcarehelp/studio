import { db } from './config'; // Import Firestore instance from config
import { collection, addDoc, getDocs, serverTimestamp, query, where, type DocumentData, type QuerySnapshot } from 'firebase/firestore';
import type { Doctor, UserProfile } from '@/types';

// Add a doctor to Firestore
export async function addDoctor(doctorData: Omit<Doctor, 'id' | 'rating' | 'availability' | 'imageUrl' | 'isVerified' | 'dataAiHint'> & Partial<Pick<Doctor, 'rating' | 'availability' | 'imageUrl' | 'isVerified' | 'dataAiHint'>>): Promise<Doctor> {
  try {
    const docDataWithTimestamp = {
      ...doctorData,
      rating: doctorData.rating || (Math.random() * 1.5 + 3.5).toFixed(1), // Random rating between 3.5 and 5.0
      availability: doctorData.availability || (Math.random() > 0.5 ? "Available Today" : "Next 3 days"),
      imageUrl: doctorData.imageUrl || "https://placehold.co/400x250.png",
      isVerified: doctorData.isVerified === undefined ? true : doctorData.isVerified,
      dataAiHint: doctorData.dataAiHint || "doctor portrait",
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "doctors"), docDataWithTimestamp);
    console.log("Doctor added to Firestore with ID: ", docRef.id);
    return { id: docRef.id, ...docDataWithTimestamp } as Doctor; // Timestamps will be handled by Firestore
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
    return []; // Return empty array on error
  }
}

// Add a patient to Firestore
export async function addPatient(
  patientData: Omit<UserProfile, 'id' | 'avatarUrl' | 'medicalHistory' | 'savedAddresses' | 'paymentMethods' | 'doctorDetails' | 'pharmacyDetails' | 'labAffiliation'>
): Promise<UserProfile> {
  try {
    const patientDataWithTimestamp = {
      ...patientData,
      role: 'patient' as const,
      avatarUrl: patientData.avatarUrl || "https://placehold.co/200x200.png",
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
  labWorkerData: Omit<UserProfile, 'id' | 'avatarUrl' | 'medicalHistory' | 'savedAddresses' | 'paymentMethods' | 'doctorDetails' | 'pharmacyDetails'> & { labAffiliation: string }
): Promise<UserProfile> {
  try {
    const labWorkerDataWithTimestamp = {
      name: labWorkerData.name,
      phone: labWorkerData.phone,
      email: labWorkerData.email,
      role: 'lab_worker' as const,
      location: labWorkerData.location,
      labAffiliation: labWorkerData.labAffiliation,
      avatarUrl: "https://placehold.co/200x200.png",
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

// Simulate adding a pharmacist to Firestore
export async function addPharmacist(
  pharmacistData: Omit<UserProfile, 'id' | 'avatarUrl' | 'medicalHistory' | 'savedAddresses' | 'paymentMethods' | 'doctorDetails' | 'labAffiliation'> & { pharmacyDetails: { name: string; license: string; } }
): Promise<UserProfile> {
   try {
    const pharmacistDataWithTimestamp = {
      name: pharmacistData.name,
      phone: pharmacistData.phone,
      email: pharmacistData.email,
      role: 'pharmacist' as const,
      location: pharmacistData.location,
      pharmacyDetails: pharmacistData.pharmacyDetails,
      avatarUrl: "https://placehold.co/200x200.png", // Default avatar
      createdAt: serverTimestamp(),
       // Mock geocoding for now
      latitude: pharmacistData.location?.toLowerCase().includes("new york") ? 40.7128 : pharmacistData.location?.toLowerCase().includes("london") ? 51.5074 : 12.9716, // Default to Bangalore
      longitude: pharmacistData.location?.toLowerCase().includes("new york") ? -74.0060 : pharmacistData.location?.toLowerCase().includes("london") ? -0.1278 : 77.5946, // Default to Bangalore
    };
    console.log("Simulating geocoding for pharmacist location:", pharmacistData.location, "-> Lat:", pharmacistDataWithTimestamp.latitude, "Lng:", pharmacistDataWithTimestamp.longitude);

    const docRef = await addDoc(collection(db, "pharmacists"), pharmacistDataWithTimestamp);
    console.log("Pharmacist added to Firestore with ID: ", docRef.id);
    return { id: docRef.id, ...pharmacistDataWithTimestamp } as UserProfile;
  } catch (error) {
    console.error("Error adding pharmacist to Firestore: ", error);
    throw error;
  }
}
