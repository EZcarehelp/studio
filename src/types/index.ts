
import { z } from 'zod';

export interface Doctor {
  id: string;
  uid?: string; // Firebase Auth UID
  name: string;
  username?: string;
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

// For Chatbot context when discussing a specific report
export const ReportContextSchema = z.object({
  reportName: z.string().optional().describe("The name or title of the lab report being discussed, e.g., 'Blood Sugar Report - June 10th'."),
  imageDataUri: z.string().optional().describe("The data URI of the lab report image, if available and relevant for visual analysis by the AI."),
  textSummary: z.string().optional().describe("A text summary of the lab report, which could be from a previous AI analysis or notes from the lab.")
}).optional();
export type ReportContext = z.infer<typeof ReportContextSchema>;


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
  uid?: string; // Firebase Auth UID
  name: string;
  username?: string;
  email?: string;
  phone: string;
  role: 'patient' | 'doctor' | 'lab_worker';
  avatarUrl?: string;
  location?: string;
  medicalHistory?: string[];
  savedAddresses?: Address[];
  paymentMethods?: PaymentMethod[];
  doctorDetails?: Partial<Doctor>;
  labAffiliation?: string;
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
  labName?: string; 
  location?: string; 
  rating?: number; 
  dataAiHint?: string; 
}

// Schema for AI Lab Report Analysis Output
export const AiLabReportAnalysisOutputSchema = z.object({
  medicalSummary: z.string().describe("A brief, easy-to-understand summary of key findings from the report (e.g., 'Hemoglobin slightly low', 'Blood sugar within normal range'). Aim for 2-3 sentences."),
  keyParameterAnalyses: z.array(z.object({
    parameter: z.string().describe("The medical parameter observed (e.g., 'Hemoglobin', 'Glucose', 'LDL Cholesterol')."),
    value: z.string().describe("The reported value of the parameter, including units if visible (e.g., '10.5 g/dL', '95 mg/dL')."),
    interpretation: z.string().describe("A brief interpretation of this value (e.g., 'Slightly Low', 'Normal', 'High', 'Within Reference Range').")
  })).optional().describe("Detailed list of 2-5 most important or abnormal findings with their values and interpretation. Focus on values outside normal ranges if identifiable, or key health indicators."),
  actionableSuggestions: z.array(z.string()).describe("A list of 2-4 actionable health suggestions or lifestyle advice based on the report (e.g., 'Increase intake of iron-rich foods like spinach and lentils', 'Consider a 20-minute brisk walk daily', 'Ensure adequate hydration by drinking 8 glasses of water.'). These should be specific where possible, linking back to report findings."),
  warningsOrWatchouts: z.array(z.string()).optional().describe("Important warnings, symptoms to watch out for, or when to consult a doctor based on the report (e.g., 'Consult a doctor if you experience persistent fatigue or dizziness', 'Monitor blood pressure regularly as advised by your physician.')."),
  nextStepRecommendation: z.string().optional().describe("A primary recommended next step for the patient, e.g., 'Book a follow-up appointment with your doctor to discuss these results', 'Consider consulting a dietitian for a personalized meal plan based on these findings'."),
  potentialFollowUpQuestions: z.array(z.string()).optional().describe("A list of 2-3 insightful follow-up questions the patient might ask their doctor based on the report analysis, to encourage further discussion and understanding (e.g., 'Given my slightly elevated X, should I be concerned about Y?', 'What are the common side effects of the suggested lifestyle change?')."),
});
export type AiLabReportAnalysisOutput = z.infer<typeof AiLabReportAnalysisOutputSchema>;


export interface LabReport {
  id: string;
  patientId: string; // ID of the patient (internal system ID or Firebase Auth UID)
  patientUsername?: string; // EzCare username of the patient this report is for
  patientName?: string; // Name of the patient, if available
  testId: string; // ID of the lab test type
  testName?: string; // Name of the lab test type
  reportImageUrl?: string; // URL if stored in cloud
  reportDataUri?: string; // Base64 data URI for AI processing or direct upload
  dateUploaded: number; // Timestamp of upload
  uploadedByLabWorkerId?: string; // ID of the lab worker who uploaded
  labName?: string; // Name of the lab (could be from lab worker's affiliation)
  messageFromLab?: string; // Optional message from lab worker to patient
  status: 'pending_upload' | 'uploaded' | 'analysis_pending' | 'analysis_complete' | 'analysis_error'; // More granular status
  aiAnalysis?: AiLabReportAnalysisOutput; // Stores the output from the AI
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

// Pharmacy related types
export type StockStatus = 'in-stock' | 'limited-stock' | 'out-of-stock';

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distance: string; // e.g. "0.5 km"
  stockStatus: StockStatus;
  deliveryTime?: string; // e.g. "30 min", "1 hr"
  pickupAvailable: boolean;
  timings?: string; // e.g. "9 AM - 10 PM"
  imageUrl?: string;
  dataAiHint?: string;
  latitude?: number;
  longitude?: number;
}
