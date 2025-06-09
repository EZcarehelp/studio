
'use server';
/**
 * @fileOverview An AI-powered chatbot for EzCare Connect that handles symptom analysis, Ayurvedic remedy suggestions, and prescription image analysis.
 *
 * - ezCareChatbotFlow - A function that handles the chatbot interaction.
 * - EzCareChatbotInput - The input type for the ezCareChatbotFlow function.
 * - EzCareChatbotOutput - The return type for the ezCareChatbotFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AiAyurvedicRemedyOutputSchema, type AiAyurvedicRemedyOutput } from '@/types';

const PrescriptionAnalysisDetailSchema = z.object({
  name: z.string().describe("Name of the medicine identified from the prescription."),
  purpose: z.string().describe("The likely reason or condition this medicine is prescribed for, based on the prescription context or common uses."),
  benefits: z.string().describe("Key benefits or positive effects of using this medicine."),
  properUsage: z.string().describe("Detailed instructions on how to use the medicine properly, including dosage, frequency, timing (e.g., with/without food), and any common advice related to its administration.")
});

const PrescriptionInsightSchema = z.object({
  summary: z.string().optional().describe("A brief overall summary of the prescription analysis or initial observations made by the AI."),
  analyzedMedicines: z.array(PrescriptionAnalysisDetailSchema).describe("An array containing detailed analysis for each medicine identified in the prescription."),
  generalAdvice: z.string().optional().describe("Any general advice regarding the prescription as a whole, or common practices related to the medicines identified."),
  disclaimer: z.string().default("The information provided is based on AI analysis of the prescription image and is for informational purposes only. It is not a substitute for professional medical advice from your doctor or pharmacist. Always consult your healthcare provider for any questions regarding your medication or health conditions.").describe("Standard medical disclaimer about the AI analysis.")
});
export type PrescriptionInsight = z.infer<typeof PrescriptionInsightSchema>;


const EzCareChatbotInputSchema = z.object({
  query: z.string().describe("User's query for symptom analysis, remedy suggestion, or context for prescription analysis."),
  prescriptionImage?: z.string().optional().describe("A prescription image as a data URI, if the user uploads one for analysis. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type EzCareChatbotInput = z.infer<typeof EzCareChatbotInputSchema>;

const EzCareChatbotOutputSchema = z.object({
  type: z.enum(['analysis', 'remedy', 'clarification', 'error', 'prescription_insight']).describe("The type of response from the chatbot."),
  analysis: z.string().optional().describe("Symptom analysis, if applicable. Include links to medical sources."),
  remedy: AiAyurvedicRemedyOutputSchema.optional().describe("Ayurvedic remedy suggestion, if applicable."),
  prescriptionInsight: PrescriptionInsightSchema.optional().describe("Analysis of an uploaded prescription image, if applicable."),
  message: z.string().optional().describe("A general message or clarification question from the chatbot."),
  errorMessage: z.string().optional().describe("Error message, if any.")
});
export type EzCareChatbotOutput = z.infer<typeof EzCareChatbotOutputSchema>;

export async function ezCareChatbotFlow(input: EzCareChatbotInput): Promise<EzCareChatbotOutput> {
  try {
    const {output} = await mainChatbotPrompt(input);
    if (!output) {
      return {
        type: 'error',
        errorMessage: "The AI model did not return a valid response."
      };
    }
    // Ensure remedy disclaimer is present if it's a remedy response
    if (output.type === 'remedy' && output.remedy && !output.remedy.disclaimer) {
      output.remedy.disclaimer = "This is for informational purposes only and not medical advice. Consult with a healthcare professional for any health concerns or before making any changes to your health regimen.";
    }
    // Ensure prescription insight disclaimer is present
    if (output.type === 'prescription_insight' && output.prescriptionInsight && !output.prescriptionInsight.disclaimer) {
      output.prescriptionInsight.disclaimer = "The information provided is based on AI analysis of the prescription image and is for informational purposes only. It is not a substitute for professional medical advice from your doctor or pharmacist. Always consult your healthcare provider for any questions regarding your medication or health conditions.";
    }
    return output;
  } catch (error) {
    console.error("Error in ezCareChatbotFlow:", error);
    return {
      type: 'error',
      errorMessage: error instanceof Error ? error.message : "An unexpected error occurred processing your request."
    };
  }
}

const mainChatbotPrompt = ai.definePrompt({
  name: 'ezCareChatbotPrompt',
  input: {schema: EzCareChatbotInputSchema},
  output: {schema: EzCareChatbotOutputSchema},
  prompt: `You are EzCare Chatbot, a friendly and empathetic AI healthcare assistant.
Your primary goal is to help users by analyzing their symptoms, suggesting Ayurvedic home remedies, or analyzing a provided prescription image.

User's query: {{{query}}}
{{#if prescriptionImage}}
Prescription Image Provided: {{media url=prescriptionImage}}
{{/if}}

Determine the user's primary intent:

{{#if prescriptionImage}}
You MUST prioritize analyzing the prescription image if provided.
 - Set the 'type' field in your response to 'prescription_insight'.
 - Analyze the image. Identify each medicine listed. For each medicine, explain:
    1. Its likely purpose (why it's prescribed, considering common uses).
    2. Key benefits of taking the medicine.
    3. Proper usage instructions (e.g., dosage frequency from prescription if visible, with/without food, general advice like 'complete the course').
 - Populate the 'prescriptionInsight.analyzedMedicines' array with these details for each identified medicine.
 - Provide an overall 'prescriptionInsight.summary' if appropriate (e.g., general class of drugs, overall goal of treatment if inferable).
 - Include 'prescriptionInsight.generalAdvice' if there are common tips applicable to the identified medicines.
 - ALWAYS include the standard 'prescriptionInsight.disclaimer'.
 - The user's text 'query' (e.g., "what is this for?", "how should I take these?") should be used as additional context for your analysis.
 - Ensure 'analysis', 'remedy', and 'message' fields are not set or are null.
{{else}}
1. If the user describes medical symptoms (e.g., "I have a headache and fever", "sore throat and cough for 3 days"):
   - Provide a preliminary analysis including potential conditions, relevant medical specialties they might consider consulting, and possible tests.
   - Include links to reputable medical sources (like Mayo Clinic, WebMD, NHS) in your analysis where appropriate.
   - Set the 'type' field in your response to 'analysis'.
   - Populate the 'analysis' field with your detailed findings.
   - Ensure 'remedy', 'prescriptionInsight', and 'message' fields are not set or are null.

2. If the user asks for a home remedy, natural solution, or Ayurvedic advice (e.g., "What's a remedy for a dry cough?", "how to improve digestion naturally?", "Ayurvedic tip for good sleep"):
   - Provide a relevant Ayurvedic remedy. Include its common name, type (herbal, digestion, inflammation, calming, general), a brief description, ingredients, preparation instructions, and usage guidelines.
   - Set the 'type' field in your response to 'remedy'.
   - Populate the 'remedy' field with the structured remedy details.
   - Ensure 'analysis', 'prescriptionInsight', and 'message' fields are not set or are null.

3. If the query is ambiguous, too vague, or you cannot confidently determine if it's for symptom analysis or a remedy (and no prescription image is provided):
   - Ask a clarifying question to understand their need better.
   - Set the 'type' field to 'clarification'.
   - Populate the 'message' field with your question.
   - Ensure 'analysis', 'remedy', and 'prescriptionInsight' fields are not set or are null.

4. If the query is outside the scope of symptom analysis, Ayurvedic remedies, or prescription image analysis (e.g., asking for medical treatment, complex medical diagnoses, emergencies, or non-health related topics):
   - Politely state that you cannot assist with that specific request and recommend consulting a healthcare professional for medical issues or seeking appropriate help for other matters.
   - Set the 'type' field to 'error'.
   - Populate the 'errorMessage' field with your polite refusal and advice.
   - Ensure 'analysis', 'remedy', and 'prescriptionInsight' fields are not set or are null.
{{/if}}

General Instructions for all responses:
- Maintain a caring and supportive tone.
- If providing analysis or a remedy (not prescription insight, which has its own), include a disclaimer: "This is for informational purposes only and not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition." This disclaimer should be part of the 'analysis' text if providing analysis, or part of the 'remedy.disclaimer' field if providing a remedy. For 'clarification' or 'error' types, you can append it to the main message if appropriate.
- Format your response strictly according to the provided JSON output schema.

`,
  config: {
    temperature: 0.7, // Might need adjustment for image analysis tasks
     safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
    ],
  }
});

