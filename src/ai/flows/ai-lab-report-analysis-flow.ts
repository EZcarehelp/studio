
'use server';
/**
 * @fileOverview An AI-powered lab report analysis tool.
 *
 * - aiLabReportAnalysis - Analyzes a lab report image and provides a structured summary.
 * - AiLabReportAnalysisInput - The input type for the function.
 * - AiLabReportAnalysisOutput - The return type for the function, now imported from @/types.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AiLabReportAnalysisOutputSchema, type AiLabReportAnalysisOutput } from '@/types'; // Import from types

const AiLabReportAnalysisInputSchema = z.object({
  reportImageDataUri: z
    .string()
    .describe(
      "An image of a lab report, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  patientContextQuery: z.string().optional().describe("Optional: Any specific question or context the patient provides regarding the report to guide the AI's focus, e.g., 'Is my cholesterol high?', 'What should I eat based on this report?'")
});
export type AiLabReportAnalysisInput = z.infer<typeof AiLabReportAnalysisInputSchema>;

// AiLabReportAnalysisOutput and its schema are now imported from @/types

export async function aiLabReportAnalysis(input: AiLabReportAnalysisInput): Promise<AiLabReportAnalysisOutput> {
  return aiLabReportAnalysisFlow(input);
}

const analysisPrompt = ai.definePrompt({
  name: 'aiLabReportAnalysisPrompt',
  input: {schema: AiLabReportAnalysisInputSchema},
  output: {schema: AiLabReportAnalysisOutputSchema}, // Use the imported schema
  prompt: `You are an AI assistant specialized in interpreting medical lab reports for patients.
You will be provided with an image of a patient's lab report and an optional context query from the patient.
Your goal is to analyze the report and provide a clear, concise, and actionable summary in JSON format.

Lab Report Image: {{media url=reportImageDataUri}}
{{#if patientContextQuery}}
Patient's Query/Context: {{{patientContextQuery}}}
{{/if}}

Follow these instructions for your analysis:
1.  **Medical Summary:** Provide a brief, easy-to-understand summary of the overall findings. Highlight any notable results. (2-3 sentences).
2.  **Key Parameter Analyses:** Identify 2-5 of the most important or abnormal parameters from the report. For each, state:
    *   The parameter name (e.g., "Hemoglobin", "Glucose", "LDL Cholesterol").
    *   The reported value, including units if visible (e.g., "10.5 g/dL", "95 mg/dL").
    *   A brief interpretation (e.g., "Slightly Low", "Normal", "High", "Within Reference Range").
    Focus on values outside normal ranges if identifiable, or key health indicators.
3.  **Actionable Suggestions:** Based on the report, offer 2-4 actionable health or lifestyle suggestions (e.g., "Given the slightly low Hemoglobin, consider increasing intake of iron-rich foods like spinach and lentils," "To help manage blood sugar, aim for a 20-minute brisk walk daily," "Ensure adequate hydration by drinking 8 glasses of water."). These should be general wellness tips, but try to link them to specific findings if appropriate.
4.  **Warnings or Watch-outs:** List any important warnings or symptoms the patient should watch out for, or conditions under which they should consult a doctor (e.g., "Consult a doctor if you experience persistent fatigue or dizziness," "Monitor blood pressure regularly as advised by your physician.").
5.  **Next Step Recommendation:** Suggest a primary next step for the patient (e.g., "Book a follow-up appointment with your doctor to discuss these results," "Consider consulting a dietitian for a personalized meal plan based on these findings.").
6.  **Potential Follow-Up Questions:** Based on your analysis, suggest 2-3 specific and insightful questions the patient could ask their doctor to better understand their results or next steps (e.g., "Given my slightly elevated LDL cholesterol, what lifestyle changes are most effective?", "Are there any over-the-counter supplements that could support my Vitamin D levels?").

Constraints:
-   **DO NOT PROVIDE A MEDICAL DIAGNOSIS.** Your role is to interpret and summarize, not diagnose.
-   Use simple language that a patient can understand. Avoid overly technical jargon where possible, or explain it briefly.
-   Ensure all output fields in the JSON schema are populated appropriately. If a section (like warnings or follow-up questions) is not applicable or no good suggestions can be made, you can provide a statement like "No specific warnings based on this report alone, but always consult your doctor for concerns." or an empty array if the schema allows.
-   If the image quality is too poor to extract meaningful information, clearly state that in the medicalSummary and other fields as appropriate.

Output the entire response strictly in the specified JSON format.
`,
  config: {
    temperature: 0.3, 
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
    ],
  }
});

const aiLabReportAnalysisFlow = ai.defineFlow(
  {
    name: 'aiLabReportAnalysisFlow',
    inputSchema: AiLabReportAnalysisInputSchema,
    outputSchema: AiLabReportAnalysisOutputSchema, // Use the imported schema
  },
  async (input) => {
    const {output} = await analysisPrompt(input);
    
    if (!output) {
        throw new Error("The AI model did not return a valid lab report analysis.");
    }
    // Ensure arrays are present even if empty, if schema implies they could be omitted by the model
    if (!output.actionableSuggestions) output.actionableSuggestions = [];
    if (!output.warningsOrWatchouts) output.warningsOrWatchouts = [];
    if (!output.keyParameterAnalyses) output.keyParameterAnalyses = [];
    if (!output.potentialFollowUpQuestions) output.potentialFollowUpQuestions = [];
    
    return output;
  }
);

    
