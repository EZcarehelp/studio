
'use server';
/**
 * @fileOverview An AI-powered Ayurvedic remedy suggestion tool.
 *
 * - aiAyurvedicRemedy - A function that handles the remedy suggestion process.
 * - AiAyurvedicRemedyInput - The input type for the aiAyurvedicRemedy function.
 * - AiAyurvedicRemedyOutput - The return type for the aiAyurvedicRemedy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
// Import the Zod schema and the output type from src/types/index.ts
import { AiAyurvedicRemedyOutputSchema, type AiAyurvedicRemedyOutput } from '@/types';

const AiAyurvedicRemedyInputSchema = z.object({
  query: z.string().min(3).max(200).describe('User\'s request for an Ayurvedic remedy, e.g., "remedy for dry cough" or "how to improve digestion".'),
  // You could add more context here like user's age, existing conditions if allowed and handled ethically
});
export type AiAyurvedicRemedyInput = z.infer<typeof AiAyurvedicRemedyInputSchema>;

// AiAyurvedicRemedyOutputSchema and AiAyurvedicRemedyOutput are now imported from @/types

export async function aiAyurvedicRemedy(input: AiAyurvedicRemedyInput): Promise<AiAyurvedicRemedyOutput> {
  return aiAyurvedicRemedyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiAyurvedicRemedyPrompt',
  input: {schema: AiAyurvedicRemedyInputSchema},
  output: {schema: AiAyurvedicRemedyOutputSchema}, // Use the imported Zod schema
  prompt: `You are an AI assistant knowledgeable in traditional Ayurvedic remedies. A user will describe an ailment or ask for general wellness advice (e.g., "{{query}}").
Provide a simple, safe, and common Ayurvedic remedy or piece of advice if appropriate.
If providing a specific remedy, include its name, a brief description, its type (herbal, digestion, inflammation, calming, or general), ingredients, preparation instructions, and usage.
If providing general advice, ensure the remedyName is a concise title for the advice, and populate description, type, and usage fields appropriately. Ingredients and preparation may be omitted for general advice.
Always include a disclaimer that this is not medical advice and a professional should be consulted.
If you cannot provide a specific remedy, or if the query is too complex, medical in nature, or outside the scope of general Ayurvedic home remedies, politely state that and suggest consulting a qualified Ayurvedic practitioner or healthcare professional. In such cases, make the remedyName something like "Consult a Professional" and fill the description field with your reasoning.
Format your response strictly according to the provided JSON schema.

User's query: {{{query}}}
`,
  config: {
    temperature: 0.6, 
     safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
       {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
       {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      }
    ],
  }
});

const aiAyurvedicRemedyFlow = ai.defineFlow(
  {
    name: 'aiAyurvedicRemedyFlow',
    inputSchema: AiAyurvedicRemedyInputSchema,
    outputSchema: AiAyurvedicRemedyOutputSchema, // Use the imported Zod schema
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("The AI model did not return a valid remedy suggestion.");
    }
    if (!output.disclaimer) {
        output.disclaimer = "This is for informational purposes only and not medical advice. Consult with a healthcare professional for any health concerns or before making any changes to your health regimen.";
    }
    return output;
  }
);
