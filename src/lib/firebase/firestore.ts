
// Mock Firestore interactions
import type { Doctor, PharmacyProfile, UserProfile } from '@/types';

// In-memory store for doctors for mocking purposes
let mockDoctorsDB: Doctor[] = [
  { id: "doc1-firebase", name: "Dr. Alice Smith (Firebase)", specialty: "Cardiologist", experience: 10, rating: 4.8, consultationFee: 1500, availability: "Available Today", imageUrl: "https://placehold.co/400x250.png", isVerified: true, location: "New York, NY", dataAiHint: "doctor portrait", licenseNumber: "L123", clinicHours: "Mon-Fri 9am-5pm" },
  { id: "doc2-firebase", name: "Dr. Bob Johnson (Firebase)", specialty: "Dermatologist", experience: 7, rating: 4.5, consultationFee: 1200, availability: "Next 3 days", imageUrl: "https://placehold.co/400x250.png", isVerified: true, location: "London, UK", dataAiHint: "doctor portrait", licenseNumber: "L456", clinicHours: "Tue-Sat 10am-6pm" },
  { id: "doc3-firebase", name: "Dr. Carol Williams (Firebase)", specialty: "Pediatrician", experience: 12, rating: 4.9, consultationFee: 1000, availability: "Available Today", imageUrl: "https://placehold.co/400x250.png", isVerified: true, location: "Mumbai, MH", dataAiHint: "doctor portrait", licenseNumber: "L789", clinicHours: "Mon, Wed, Fri 8am-4pm" },
];

// In-memory store for pharmacists
let mockPharmacistsDB: UserProfile[] = [];


// Simulate adding a doctor to Firestore
export async function addDoctor(doctorData: Omit<Doctor, 'id' | 'rating' | 'availability' | 'imageUrl' | 'isVerified' | 'dataAiHint'> & Partial<Pick<Doctor, 'rating' | 'availability' | 'imageUrl' | 'isVerified' | 'dataAiHint'>>): Promise<Doctor> {
  console.log("Mock Firestore: Adding doctor", doctorData);
  const newDoctor: Doctor = {
    id: `doc${Date.now()}-firebase`,
    ...doctorData,
    rating: doctorData.rating || Math.floor(Math.random() * 2) + 3.5, // Random rating 3.5-4.5
    availability: doctorData.availability || (Math.random() > 0.5 ? "Available Today" : "Next 3 days"),
    imageUrl: doctorData.imageUrl || "https://placehold.co/400x250.png",
    isVerified: doctorData.isVerified || false, // Doctors start unverified, to be verified by admin
    dataAiHint: doctorData.dataAiHint || "doctor portrait",
  };
  mockDoctorsDB.push(newDoctor);
  console.log("Mock Firestore: Doctor added", newDoctor);
  return newDoctor;
}

// Simulate fetching doctors from Firestore
export async function getDoctors(): Promise<Doctor[]> {
  console.log("Mock Firestore: Fetching doctors");
  // In a real app, this would query Firestore
  return [...mockDoctorsDB]; // Return a copy to prevent direct modification
}

// Simulate fetching a single doctor by ID
export async function getDoctorById(id: string): Promise<Doctor | null> {
  console.log(`Mock Firestore: Fetching doctor with ID ${id}`);
  const doctor = mockDoctorsDB.find(doc => doc.id === id);
  return doctor || null;
}

// Simulate updating doctor details (e.g., for settings)
export async function updateDoctor(doctorId: string, updates: Partial<Doctor>): Promise<Doctor | null> {
  console.log(`Mock Firestore: Updating doctor ${doctorId} with`, updates);
  const doctorIndex = mockDoctorsDB.findIndex(doc => doc.id === doctorId);
  if (doctorIndex !== -1) {
    mockDoctorsDB[doctorIndex] = { ...mockDoctorsDB[doctorIndex], ...updates };
    return mockDoctorsDB[doctorIndex];
  }
  return null;
}

// Simulate adding a pharmacist to Firestore
export async function addPharmacist(
  pharmacistData: Omit<UserProfile, 'id' | 'avatarUrl' | 'medicalHistory' | 'savedAddresses' | 'paymentMethods' | 'doctorDetails'> & { pharmacyDetails: Omit<PharmacyProfile, 'id'> }
): Promise<UserProfile> {
  console.log("Mock Firestore: Adding pharmacist", pharmacistData);
  const newPharmacist: UserProfile = {
    id: `pharm${Date.now()}-firebase`,
    name: pharmacistData.name,
    phone: pharmacistData.phone,
    email: pharmacistData.email,
    role: 'pharmacist',
    location: pharmacistData.location,
    pharmacyDetails: {
      id: `pharmaDetail${Date.now()}`,
      ...pharmacistData.pharmacyDetails,
    },
    avatarUrl: pharmacistData.avatarUrl || "https://placehold.co/200x200.png",
  };
  mockPharmacistsDB.push(newPharmacist);
  console.log("Mock Firestore: Pharmacist added", newPharmacist);
  return newPharmacist;
}

// Add more mock functions as needed for patients, appointments, etc.
