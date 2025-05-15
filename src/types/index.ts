
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number; // years
  rating: number; // 0-5
  consultationFee: number; // INR
  availability: string; // e.g., "Available Today", "Next 3 days"
  imageUrl: string;
  isVerified: boolean;
  location?: string;
  bio?: string;
  licenseNumber?: string;
  clinicHours?: string; 
  onlineConsultationEnabled?: boolean;
  weeklyAvailability?: { 
    [day: string]: boolean; 
  };
  dataAiHint?: string;
}

export interface Medicine {
  id: string;
  name: string;
  description: string;
  price: number; // INR
  rating: number; // 0-5
  imageUrl: string;
  category: string; 
  affiliateLink: string; 
  dataAiHint?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string; 
  receiverId: string;
  text?: string;
  timestamp: number; 
  isRead?: boolean;
  type: 'text' | 'prescription' | 'image'; 
  prescriptionDetails?: Prescription; 
  imageUrl?: string; 
}

export interface Prescription {
  id: string;
  doctorId: string;
  patientId: string;
  dateIssued: number;
  medicines: Array<{ name: string; dosage: string; duration: string }>;
  notes?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  patientPhone?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  issue: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: 'patient' | 'doctor' | 'lab_worker' | 'pharmacist';
  avatarUrl?: string;
  location?: string; 
  medicalHistory?: string[];
  savedAddresses?: Address[];
  paymentMethods?: PaymentMethod[];
  doctorDetails?: Partial<Doctor>; 
  pharmacyDetails?: Partial<PharmacyProfile>;
  labAffiliation?: string; // Added for Lab Worker
}

export interface PharmacyProfile {
  id: string;
  pharmacyName: string;
  licenseNumber: string;
  gstNumber?: string;
  bankDetails?: any; 
  latitude?: number; // For map integration
  longitude?: number; // For map integration
  // other pharmacy specific details
}


export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi'; 
  last4?: string;
  expiry?: string; 
  isDefault?: boolean;
}

export interface LabTest {
  id: string;
  name: string;
  description: string;
  price?: number; 
}

export interface LabReport {
  id: string;
  patientId: string;
  patientName?: string; 
  testId: string;
  testName?: string; 
  reportImageUrl?: string; 
  reportDataUri?: string; 
  dateUploaded: number; 
  notesByLabWorker?: string;
  status: 'pending_analysis' | 'analysis_complete' | 'error';
  dietPlan?: string; 
  keyFindings?: string[]; 
  dataAiHint?: string; 
}

export type RemedyType = 'herbal' | 'digestion' | 'inflammation' | 'calming' | 'general';

export interface AyurvedicRemedy {
  id: string;
  name: string;
  type: RemedyType;
  tags: string[]; 
  description: string;
  ingredients: string[];
  preparation: string; 
  usage?: string; 
  imageUrl?: string; 
  source?: string; 
  isFavorite?: boolean; 
  dataAiHint?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  snippet: string; 
  imageUrl: string; 
  sourceName: string;
  publishedAt: string; 
  articleUrl: string;
  dataAiHint?: string;
}

export type StockStatus = 'in-stock' | 'limited-stock' | 'out-of-stock';

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distance: string; // e.g., "0.5 km"
  stockStatus: StockStatus;
  deliveryTime?: string; // e.g., "30 min", "1 hr"
  pickupAvailable: boolean;
  timings: string; // e.g., "9 AM - 10 PM", "24x7"
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  dataAiHint?: string;
  rating?: number; // Added optional rating
}
