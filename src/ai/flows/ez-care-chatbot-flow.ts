
'use server';
/**
 * @fileOverview An AI-powered chatbot for EzCare Connect that handles symptom analysis and Ayurvedic remedy suggestions.
 *
 * - ezCareChatbotFlow - A function that handles the chatbot interaction.
 * - EzCareChatbotInput - The input type for the ezCareChatbotFlow function.
 * - EzCareChatbotOutput - The return type for the ezCareChatbotFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
// Import the Zod schema and the type from src/types/index.ts
import { AiAyurvedicRemedyOutputSchema, type AiAyurvedicRemedyOutput } from '@/types';

const EzCareChatbotInputSchema = z.object({
  query: z.string().describe("User's query for symptom analysis or remedy suggestion."),
});
export type EzCareChatbotInput = z.infer<typeof EzCareChatbotInputSchema>;

const EzCareChatbotOutputSchema = z.object({
  type: z.enum(['analysis', 'remedy', 'clarification', 'error']).describe("The type of response from the chatbot."),
  analysis: z.string().optional().describe("Symptom analysis, if applicable. Include links to medical sources."),
  remedy: AiAyurvedicRemedyOutputSchema.optional().describe("Ayurvedic remedy suggestion, if applicable."), // Use the imported Zod schema
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
  output: {schema: EzCareChatbotOutputSchema}, // This output schema uses the imported remedy schema indirectly
  prompt: `You are EzCare Chatbot, a friendly and empathetic AI healthcare assistant.
Your primary goal is to help users by either analyzing their symptoms or suggesting Ayurvedic home remedies.

User's query: {{{query}}}

Determine the user's primary intent:
1. If the user describes medical symptoms (e.g., "I have a headache and fever", "sore throat and cough for 3 days"):
   - Provide a preliminary analysis including potential conditions, relevant medical specialties they might consider consulting, and possible tests.
   - Include links to reputable medical sources (like Mayo Clinic, WebMD, NHS) in your analysis where appropriate.
   - Set the 'type' field in your response to 'analysis'.
   - Populate the 'analysis' field with your detailed findings.
   - Ensure the 'remedy' and 'message' fields are not set or are null.

2. If the user asks for a home remedy, natural solution, or Ayurvedic advice (e.g., "What's a remedy for a dry cough?", "how to improve digestion naturally?", "Ayurvedic tip for good sleep"):
   - Provide a relevant Ayurvedic remedy. Include its common name, type (herbal, digestion, inflammation, calming, general), a brief description, ingredients, preparation instructions, and usage guidelines.
   - Set the 'type' field in your response to 'remedy'.
   - Populate the 'remedy' field with the structured remedy details.
   - Ensure the 'analysis' and 'message' fields are not set or are null.

3. If the query is ambiguous, too vague, or you cannot confidently determine if it's for symptom analysis or a remedy:
   - Ask a clarifying question to understand their need better.
   - Set the 'type' field to 'clarification'.
   - Populate the 'message' field with your question.
   - Ensure the 'analysis' and 'remedy' fields are not set or are null.

4. If the query is outside the scope of symptom analysis or Ayurvedic remedies (e.g., asking for medical treatment, complex medical diagnoses, emergencies, or non-health related topics):
   - Politely state that you cannot assist with that specific request and recommend consulting a healthcare professional for medical issues or seeking appropriate help for other matters.
   - Set the 'type' field to 'error'.
   - Populate the 'errorMessage' field with your polite refusal and advice.
   - Ensure the 'analysis' and 'remedy' fields are not set or are null.


General Instructions for all responses:
- Maintain a caring and supportive tone.
- ALWAYS include a disclaimer: "This is for informational purposes only and not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition." This disclaimer should be part of the 'analysis' text if providing analysis, or part of the 'remedy.disclaimer' field if providing a remedy. For 'clarification' or 'error' types, you can append it to the main message if appropriate, or ensure the UI handles a global disclaimer.
- Format your response strictly according to the provided JSON output schema.

`,
  config: {
    temperature: 0.7,
     safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
    ],
  }
});
