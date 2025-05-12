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
import type { RemedyType } from '@/types';

export const AiAyurvedicRemedyInputSchema = z.object({
  query: z.string().min(3).max(200).describe('User\'s request for an Ayurvedic remedy, e.g., "remedy for dry cough" or "how to improve digestion".'),
  // You could add more context here like user's age, existing conditions if allowed and handled ethically
});
export type AiAyurvedicRemedyInput = z.infer<typeof AiAyurvedicRemedyInputSchema>;

const remedyTypeEnum = z.enum(['herbal', 'digestion', 'inflammation', 'calming', 'general']) satisfies z.ZodType<RemedyType>;


export const AiAyurvedicRemedyOutputSchema = z.object({
  remedyName: z.string().describe("The common name of the Ayurvedic remedy, or a title for the suggestion if it's general advice."),
  type: remedyTypeEnum.describe("The category type of the remedy based on its primary use or ingredients. Use 'general' if no specific category fits well."),
  description: z.string().describe("A brief description of what the remedy is for or what the advice addresses."),
  ingredients: z.array(z.string()).optional().describe("A list of ingredients required for the remedy. Omit if it's general advice not involving specific preparations."),
  preparation: z.string().optional().describe("Step-by-step preparation instructions. Omit if it's general advice."),
  usage: z.string().optional().describe("How and when to use the remedy or apply the advice. Include dosage if applicable for a remedy."),
  notes: z.string().optional().describe("Any additional notes, warnings, or tips related to the remedy/advice."),
  disclaimer: z.string().default("This is for informational purposes only and not medical advice. Consult with a healthcare professional for any health concerns or before making any changes to your health regimen.").describe("A standard disclaimer.")
});
export type AiAyurvedicRemedyOutput = z.infer<typeof AiAyurvedicRemedyOutputSchema>;

export async function aiAyurvedicRemedy(input: AiAyurvedicRemedyInput): Promise<AiAyurvedicRemedyOutput> {
  return aiAyurvedicRemedyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiAyurvedicRemedyPrompt',
  input: {schema: AiAyurvedicRemedyInputSchema},
  output: {schema: AiAyurvedicRemedyOutputSchema},
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
    temperature: 0.6, // Allow for some variation but keep it factual.
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
    outputSchema: AiAyurvedicRemedyOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("The AI model did not return a valid remedy suggestion.");
    }
    // Ensure disclaimer is present, even if model forgets
    if (!output.disclaimer) {
        output.disclaimer = "This is for informational purposes only and not medical advice. Consult with a healthcare professional for any health concerns or before making any changes to your health regimen.";
    }
    return output;
  }
);
