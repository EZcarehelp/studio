
'use server';
/**
 * @fileOverview An AI-powered chatbot for EzCare Connect that handles symptom analysis, Ayurvedic remedy suggestions, prescription image analysis, and contextual lab report Q&A.
 *
 * - ezCareChatbotFlow - A function that handles the chatbot interaction.
 * - EzCareChatbotInput - The input type for the ezCareChatbotFlow function.
 * - EzCareChatbotOutput - The return type for the ezCareChatbotFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AiAyurvedicRemedyOutputSchema, type AiAyurvedicRemedyOutput, ReportContextSchema, type ReportContext } from '@/types';

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
  query: z.string().describe("User's query for symptom analysis, remedy suggestion, or context for prescription analysis or lab report Q&A."),
  prescriptionImage: z.string().optional().describe("A prescription image as a data URI, if the user uploads one for analysis. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  currentReportContext: ReportContextSchema.optional().describe("Context about a specific lab report the user is currently viewing and asking questions about. Includes report name, image data URI, and/or text summary."),
});
export type EzCareChatbotInput = z.infer<typeof EzCareChatbotInputSchema>;

const EzCareChatbotOutputSchema = z.object({
  type: z.enum(['analysis', 'remedy', 'clarification', 'error', 'prescription_insight', 'report_insight']).describe("The type of response from the chatbot."),
  analysis: z.string().optional().describe("Symptom analysis, if applicable. Include links to medical sources. If stress is mentioned, include yoga/relaxation suggestions here."),
  remedy: AiAyurvedicRemedyOutputSchema.optional().describe("Ayurvedic remedy suggestion, if applicable."),
  prescriptionInsight: PrescriptionInsightSchema.optional().describe("Analysis of an uploaded prescription image, if applicable."),
  reportInsightMessage: z.string().optional().describe("A message from the AI specifically addressing a query about a lab report, using the provided context."),
  message: z.string().optional().describe("A general message or clarification question from the chatbot. If stress is mentioned vaguely, include yoga/relaxation suggestions here."),
  errorMessage: z.string().optional().describe("Error message, if any.")
});
export type EzCareChatbotOutput = z.infer<typeof EzCareChatbotOutputSchema>;

export async function ezCareChatbotFlow(input: EzCareChatbotInput): Promise<EzCareChatbotOutput> {
  try {
    console.log("Chatbot Input:", JSON.stringify(input, null, 2));
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
    // Ensure report insight disclaimer (if applicable)
    if (output.type === 'report_insight' && !output.reportInsightMessage?.toLowerCase().includes('medical advice')) {
        output.reportInsightMessage = (output.reportInsightMessage || "") + "\n\nNote: This information is based on AI analysis and is not a substitute for professional medical advice. Always consult your doctor.";
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
  prompt: `You are EzCare Chatbot, a very friendly, warm, and empathetic AI healthcare assistant.
Your primary goal is to help users by analyzing their symptoms, suggesting Ayurvedic home remedies, analyzing a provided prescription image, or answering questions about a specific lab report they are viewing.
Maintain a caring and supportive tone in all your responses.

User's query: {{{query}}}

{{#if currentReportContext}}
The user is currently viewing a lab report named "{{currentReportContext.reportName}}" and has asked a question about it.
{{#if currentReportContext.imageDataUri}}
Lab Report Image for Context: {{media url=currentReportContext.imageDataUri}}
{{/if}}
{{#if currentReportContext.textSummary}}
Contextual Summary/Notes for this report: {{{currentReportContext.textSummary}}}
{{/if}}
Your task:
 - Analyze the user's query ("{{{query}}}") in the context of this lab report.
 - If the query is directly answerable from the report data (e.g., "what does X value mean?", "is Y normal?", "based on this report, can I eat Z?"), provide a concise, helpful answer.
 - If the report image is provided, use it as the primary source. If text summary is also provided, use it as supporting information.
 - Set the 'type' field in your response to 'report_insight'.
 - Populate the 'reportInsightMessage' field with your answer.
 - Example: If the report shows high sugar and the user asks "Can I eat jelabi?", respond with something like: "Based on your report showing elevated sugar levels, it's advisable to avoid sweets like jelabi. It's best to discuss dietary changes with your doctor."
 - Ensure 'analysis', 'remedy', 'prescriptionInsight', and 'message' fields are not set or are null.
 - Always include a disclaimer that this is not medical advice and they should consult their doctor.

{{else if prescriptionImage}}
You MUST prioritize analyzing the prescription image if provided.
 - Set the 'type' field in your response to 'prescription_insight'.
 - Analyze the image. Identify each medicine listed. For each medicine, explain:
    1. Its likely purpose (why it's prescribed, considering common uses).
    2. Key benefits of taking the medicine.
    3. Proper usage instructions (e.g., dosage frequency from prescription if visible, with/without food, general advice like 'complete the course').
 - Populate the 'prescriptionInsight.analyzedMedicines' array with these details for each identified medicine.
 - Provide an overall 'prescriptionInsight.summary' if appropriate.
 - Include 'prescriptionInsight.generalAdvice' if there are common tips applicable.
 - ALWAYS include the standard 'prescriptionInsight.disclaimer'.
 - The user's text 'query' should be used as additional context.
 - Ensure 'analysis', 'remedy', 'reportInsightMessage', and 'message' fields are not set or are null.

{{else}}
1. If the user describes medical symptoms (e.g., "I have a headache and fever", "I'm feeling very stressed and anxious"):
   - Provide a preliminary analysis including potential conditions, relevant medical specialties, and possible tests.
   - Include links to reputable medical sources (like Mayo Clinic, WebMD, NHS).
   - **If the user mentions stress, anxiety, feeling overwhelmed, or similar mental well-being concerns:**
     - Acknowledge their feelings empathetically.
     - In addition to other analysis, gently suggest considering activities like yoga, meditation, or deep breathing exercises.
     - Example phrasing for stress: "I understand you're feeling stressed and anxious. Many people find activities like yoga or simple breathing exercises very helpful for managing these feelings. It's something you could consider alongside looking into your other symptoms."
     - Integrate this suggestion as part of the 'analysis' text.
   - Set the 'type' field to 'analysis'.
   - Populate the 'analysis' field.
   - Ensure 'remedy', 'prescriptionInsight', 'reportInsightMessage', and 'message' fields are not set or are null.

2. If the user asks for a home remedy or Ayurvedic advice (e.g., "What's a remedy for a dry cough?"):
   - Provide a relevant Ayurvedic remedy (name, type, description, ingredients, preparation, usage).
   - Set the 'type' field to 'remedy'.
   - Populate the 'remedy' field.
   - Ensure 'analysis', 'prescriptionInsight', 'reportInsightMessage', and 'message' fields are not set or are null.

3. If the query is ambiguous, too vague, or you cannot confidently determine intent (and no prescription image or report context is provided):
   - Ask a clarifying question in a friendly tone.
   - **If the vague query hints at stress (e.g., "I'm not feeling good"):** You can include a gentle suggestion like, "Sometimes when we're not feeling our best, simple relaxation techniques like deep breathing or a short walk can help. Could you tell me a bit more about what's bothering you?"
   - Set the 'type' field to 'clarification'.
   - Populate the 'message' field.
   - Ensure other specific output fields are null.

4. If the query is outside scope (e.g., medical treatment, emergencies, non-health topics):
   - Politely state inability to assist and recommend consulting a healthcare professional.
   - Set the 'type' field to 'error'.
   - Populate the 'errorMessage' field.
   - Ensure other specific output fields are null.
{{/if}}

General Instructions for all responses:
- Maintain a very friendly, caring, warm, and supportive tone.
- If providing 'analysis' or 'remedy', include a disclaimer: "This is for informational purposes and not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider." This should be part of the 'analysis' text or 'remedy.disclaimer'.
- For 'report_insight', the disclaimer is integrated into the main instruction: "Always include a disclaimer that this is not medical advice and they should consult their doctor." This should be part of the 'reportInsightMessage'.
- Format your response strictly according to the provided JSON output schema.
`,
  config: {
    temperature: 0.6,
     safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
    ],
  }
});

