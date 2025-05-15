
// Mock Firestore interactions
import type { Doctor, PharmacyProfile, UserProfile } from '@/types';

// In-memory store for doctors for mocking purposes
let mockDoctorsDB: Doctor[] = [
  { id: "doc1-firebase", name: "Dr. Alice Smith", specialty: "Cardiologist", experience: 10, rating: 4.8, consultationFee: 1500, availability: "Available Today", imageUrl: "https://placehold.co/400x250.png", isVerified: true, location: "New York, NY", dataAiHint: "doctor portrait", licenseNumber: "L123", clinicHours: "Mon-Fri 9am-5pm" },
  { id: "doc2-firebase", name: "Dr. Bob Johnson", specialty: "Dermatologist", experience: 7, rating: 4.5, consultationFee: 1200, availability: "Next 3 days", imageUrl: "https://placehold.co/400x250.png", isVerified: true, location: "London, UK", dataAiHint: "doctor portrait", licenseNumber: "L456", clinicHours: "Tue-Sat 10am-6pm" },
  { id: "doc3-firebase", name: "Dr. Carol Williams", specialty: "Pediatrician", experience: 12, rating: 4.9, consultationFee: 1000, availability: "Available Today", imageUrl: "https://placehold.co/400x250.png", isVerified: true, location: "Mumbai, MH", dataAiHint: "doctor portrait", licenseNumber: "L789", clinicHours: "Mon, Wed, Fri 8am-4pm" },
];

// In-memory store for pharmacists
let mockPharmacistsDB: UserProfile[] = [];
// In-memory store for lab workers
let mockLabWorkersDB: UserProfile[] = [];


// Simulate adding a doctor to Firestore
export async function addDoctor(doctorData: Omit<Doctor, 'id' | 'rating' | 'availability' | 'imageUrl' | 'isVerified' | 'dataAiHint'> & Partial<Pick<Doctor, 'rating' | 'availability' | 'imageUrl' | 'isVerified' | 'dataAiHint'>>): Promise<Doctor> {
  console.log("Mock Firestore: Adding doctor", doctorData);
  const newDoctor: Doctor = {
    id: `doc${Date.now()}-firebase`,
    ...doctorData,
    rating: doctorData.rating || Math.floor(Math.random() * 2) + 3.5, 
    availability: doctorData.availability || (Math.random() > 0.5 ? "Available Today" : "Next 3 days"),
    imageUrl: doctorData.imageUrl || "https://placehold.co/400x250.png",
    isVerified: doctorData.isVerified === undefined ? true : doctorData.isVerified, // Default to true if not provided
    dataAiHint: doctorData.dataAiHint || "doctor portrait",
  };
  mockDoctorsDB.push(newDoctor);
  console.log("Mock Firestore: Doctor added", newDoctor);
  return newDoctor;
}

// Simulate fetching doctors from Firestore
export async function getDoctors(): Promise<Doctor[]> {
  console.log("Mock Firestore: Fetching doctors");
  return [...mockDoctorsDB]; 
}

// Simulate fetching a single doctor by ID
export async function getDoctorById(id: string): Promise<Doctor | null> {
  console.log(`Mock Firestore: Fetching doctor with ID ${id}`);
  const doctor = mockDoctorsDB.find(doc => doc.id === id);
  return doctor || null;
}

// Simulate updating doctor details
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
  pharmacistData: Omit<UserProfile, 'id' | 'avatarUrl' | 'medicalHistory' | 'savedAddresses' | 'paymentMethods' | 'doctorDetails' | 'pharmacyDetails' | 'labAffiliation'> & 
                  { pharmacyDetails: Omit<PharmacyProfile, 'id' | 'latitude' | 'longitude'> }
): Promise<UserProfile> {
  console.log("Mock Firestore: Adding pharmacist", pharmacistData);
  
  let mockLat = 12.9716; // Default mock (Bangalore)
  let mockLon = 77.5946;
  if (pharmacistData.location?.toLowerCase().includes("new york")) {
    mockLat = 40.7128;
    mockLon = -74.0060;
  } else if (pharmacistData.location?.toLowerCase().includes("london")) {
    mockLat = 51.5074;
    mockLon = 0.1278;
  }
  console.log(`Mock Geocoding for ${pharmacistData.location}: Lat ${mockLat}, Lon ${mockLon}`);

  const newPharmacist: UserProfile = {
    id: `pharm${Date.now()}-firebase`,
    name: pharmacistData.name,
    phone: pharmacistData.phone,
    email: pharmacistData.email,
    role: 'pharmacist',
    location: pharmacistData.location, 
    pharmacyDetails: {
      id: `pharmaDetail${Date.now()}`,
      pharmacyName: pharmacistData.pharmacyDetails.pharmacyName,
      licenseNumber: pharmacistData.pharmacyDetails.licenseNumber,
      latitude: mockLat, 
      longitude: mockLon, 
    },
    avatarUrl: "https://placehold.co/200x200.png", 
  };
  mockPharmacistsDB.push(newPharmacist);
  console.log("Mock Firestore: Pharmacist added with mock geo-coordinates", newPharmacist);
  return newPharmacist;
}

// Simulate adding a lab worker to Firestore
export async function addLabWorker(
  labWorkerData: Omit<UserProfile, 'id' | 'avatarUrl' | 'medicalHistory' | 'savedAddresses' | 'paymentMethods' | 'doctorDetails' | 'pharmacyDetails' | 'labAffiliation'> & { labAffiliation: string }
): Promise<UserProfile> {
  console.log("Mock Firestore: Adding lab worker", labWorkerData);
  const newLabWorker: UserProfile = {
    id: `lab${Date.now()}-firebase`,
    name: labWorkerData.name,
    phone: labWorkerData.phone,
    email: labWorkerData.email,
    role: 'lab_worker',
    location: labWorkerData.location,
    labAffiliation: labWorkerData.labAffiliation,
    avatarUrl: "https://placehold.co/200x200.png", // Default avatar
  };
  mockLabWorkersDB.push(newLabWorker);
  console.log("Mock Firestore: Lab worker added", newLabWorker);
  return newLabWorker;
}
