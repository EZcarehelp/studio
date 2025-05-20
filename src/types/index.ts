
import { z } from 'zod'; 

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
  role: 'patient' | 'doctor' | 'lab_worker'; // Pharmacist role removed
  avatarUrl?: string;
  location?: string;
  medicalHistory?: string[];
  savedAddresses?: Address[];
  paymentMethods?: PaymentMethod[];
  doctorDetails?: Partial<Doctor>;
  // pharmacyDetails?: Partial<PharmacyProfile>; // Removed
  labAffiliation?: string;
}

// PharmacyProfile is no longer needed
// export interface PharmacyProfile {
//   id: string;
//   pharmacyName: string;
//   licenseNumber: string;
//   gstNumber?: string;
//   bankDetails?: any;
//   latitude?: number;
//   longitude?: number;
// }


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

export type OriginalRemedyType = 'herbal' | 'digestion' | 'inflammation' | 'calming' | 'general'; 
export const remedyTypeZodEnum = z.enum(['herbal', 'digestion', 'inflammation', 'calming', 'general']) satisfies z.ZodType<OriginalRemedyType>;

export const AiAyurvedicRemedyOutputSchema = z.object({
  remedyName: z.string().describe("The common name of the Ayurvedic remedy, or a title for the suggestion if it's general advice."),
  type: remedyTypeZodEnum.describe("The category type of the remedy based on its primary use or ingredients. Use 'general' if no specific category fits well."),
  description: z.string().describe("A brief description of what the remedy is for or what the advice addresses."),
  ingredients: z.array(z.string()).optional().describe("A list of ingredients required for the remedy. Omit if it's general advice not involving specific preparations."),
  preparation: z.string().optional().describe("Step-by-step preparation instructions. Omit if it's general advice."),
  usage: z.string().optional().describe("How and when to use the remedy or apply the advice. Include dosage if applicable for a remedy."),
  notes: z.string().optional().describe("Any additional notes, warnings, or tips related to the remedy/advice."),
  disclaimer: z.string().default("This is for informational purposes only and not medical advice. Consult with a healthcare professional for any health concerns or before making any changes to your health regimen.").describe("A standard disclaimer.")
});
export type AiAyurvedicRemedyOutput = z.infer<typeof AiAyurvedicRemedyOutputSchema>;


export interface AyurvedicRemedy {
  id: string;
  name: string;
  type: OriginalRemedyType; 
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

// StockStatus and Pharmacy types are no longer needed as Find Nearby Pharmacies feature is removed
// export type StockStatus = 'in-stock' | 'limited-stock' | 'out-of-stock';

// export interface Pharmacy {
//   id: string;
//   name: string;
//   address: string;
//   distance: string;
//   stockStatus: StockStatus;
//   deliveryTime?: string;
//   pickupAvailable: boolean;
//   timings: string;
//   latitude?: number;
//   longitude?: number;
//   imageUrl?: string;
//   dataAiHint?: string;
//   rating?: number;
// }
