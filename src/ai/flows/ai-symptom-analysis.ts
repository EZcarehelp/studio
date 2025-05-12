// 'use server';

/**
 * @fileOverview An AI-powered symptom analysis tool for patients.
 *
 * - aiSymptomAnalysis - A function that handles the symptom analysis process.
 * - AiSymptomAnalysisInput - The input type for the aiSymptomAnalysis function.
 * - AiSymptomAnalysisOutput - The return type for the aiSymptomAnalysis function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiSymptomAnalysisInputSchema = z.object({
  symptoms: z
    .string()
    .describe('A description of the symptoms the patient is experiencing.'),
});
export type AiSymptomAnalysisInput = z.infer<typeof AiSymptomAnalysisInputSchema>;

const AiSymptomAnalysisOutputSchema = z.object({
  analysis: z
    .string()
    .describe(
      'An analysis of the symptoms provided, including potential conditions, relevant specialties, and possible tests.  Include links to medical sources in the output.'
    ),
});
export type AiSymptomAnalysisOutput = z.infer<typeof AiSymptomAnalysisOutputSchema>;

export async function aiSymptomAnalysis(input: AiSymptomAnalysisInput): Promise<AiSymptomAnalysisOutput> {
  return aiSymptomAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSymptomAnalysisPrompt',
  input: {schema: AiSymptomAnalysisInputSchema},
  output: {schema: AiSymptomAnalysisOutputSchema},
  prompt: `You are an AI-powered symptom checker tool. A patient will provide you with a description of their symptoms, and you will provide an analysis of those symptoms, including potential conditions, relevant specialties, and possible tests. Include links to medical sources in the output.\n\nSymptoms: {{{symptoms}}}`,
});

const aiSymptomAnalysisFlow = ai.defineFlow(
  {
    name: 'aiSymptomAnalysisFlow',
    inputSchema: AiSymptomAnalysisInputSchema,
    outputSchema: AiSymptomAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
