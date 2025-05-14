
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
  weeklyAvailability?: {
    [day: string]: boolean; // "monday", "tuesday", etc.
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
  category: string; // e.g., "Popular", "Pain Relief"
  affiliateLink: string; // Amazon affiliate link
  dataAiHint?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string; // 'patient' or doctor's ID
  receiverId: string;
  text?: string;
  timestamp: number; // Unix timestamp
  isRead?: boolean;
  type: 'text' | 'prescription' | 'image'; // Add other types as needed
  prescriptionDetails?: Prescription; // If type is 'prescription'
  imageUrl?: string; // If type is 'image'
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
  role: 'patient' | 'doctor' | 'lab_worker';
  avatarUrl?: string;
  location?: string; // Added for patients and lab workers if needed
  // Patient specific
  medicalHistory?: string[];
  savedAddresses?: Address[];
  paymentMethods?: PaymentMethod[];
  // Doctor specific
  doctorDetails?: Partial<Doctor>; // Includes location via Doctor type
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
  type: 'card' | 'upi'; // etc.
  last4?: string;
  expiry?: string; // MM/YY for card
  isDefault?: boolean;
}

export interface LabTest {
  id: string;
  name: string;
  description: string;
  price?: number; // Optional price
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
  keyFindings?: string[]; // Added for AI Diet Plan Flow
  dataAiHint?: string; // Added for placeholder image hints
}

export type RemedyType = 'herbal' | 'digestion' | 'inflammation' | 'calming' | 'general';

export interface AyurvedicRemedy {
  id: string;
  name: string;
  type: RemedyType;
  tags: string[]; // e.g., ["cough", "cold", "home remedy"]
  description: string;
  ingredients: string[];
  preparation: string; // Step-by-step instructions
  usage?: string; // How and when to use
  imageUrl?: string; // Optional image for the remedy card
  source?: string; // Optional source or link for more info
  isFavorite?: boolean; // For user to mark as favorite
  dataAiHint?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  snippet: string; // Changed from nullable to non-nullable
  imageUrl: string; // Changed from nullable to non-nullable
  sourceName: string;
  publishedAt: string; 
  articleUrl: string;
  dataAiHint?: string;
}

