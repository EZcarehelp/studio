
'use server';
/**
 * @fileOverview An AI-powered diet plan generator based on lab report images.
 *
 * - aiDietPlanFromReportImage - A function that analyzes a lab report image and suggests a diet plan.
 * - AiDietPlanInput - The input type for the aiDietPlanFromReportImage function.
 * - AiDietPlanOutput - The return type for the aiDietPlanFromReportImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiDietPlanInputSchema = z.object({
  reportImageDataUri: z
    .string()
    .describe(
      "An image of a lab report, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AiDietPlanInput = z.infer<typeof AiDietPlanInputSchema>;

const AiDietPlanOutputSchema = z.object({
  dietPlan: z
    .string()
    .describe(
      'A suggested diet plan based on the provided lab report image. This should include general dietary advice, foods to include, and foods to avoid or limit. Keep it concise and actionable, suitable for a patient to understand. For example: "Focus on whole grains, lean proteins, and plenty of vegetables. Limit sugary drinks and processed foods. Consider adding more fiber-rich foods like beans and lentils."'
    ),
  keyFindings: z
    .array(z.string())
    .describe('A list of 2-3 key observations from the lab report that influenced the diet plan (e.g., "Slightly elevated glucose", "Low Vitamin D"). Keep these brief.'),
});
export type AiDietPlanOutput = z.infer<typeof AiDietPlanOutputSchema>;

export async function aiDietPlanFromReportImage(input: AiDietPlanInput): Promise<AiDietPlanOutput> {
  return aiDietPlanFlow(input);
}

const dietPrompt = ai.definePrompt({
  name: 'aiDietPlanPrompt',
  input: {schema: AiDietPlanInputSchema},
  output: {schema: AiDietPlanOutputSchema},
  prompt: `You are a helpful AI assistant with expertise in nutrition and interpreting lab reports for general dietary advice.
You will be provided with an image of a patient's lab report.
Analyze the lab report image and provide a simple, actionable diet plan.
Focus on general wellness and any obvious indicators from the report (e.g., high cholesterol, high blood sugar).
Do not provide medical diagnoses or specific medical treatment advice. The advice should be general dietary suggestions.

Your output must be in JSON format, adhering to the specified schema.
Identify 2-3 key findings from the report that inform your diet suggestions.
Provide a concise diet plan.

Lab Report Image: {{media url=reportImageDataUri}}

Please provide your response in the following JSON structure:
{
  "dietPlan": "A concise diet plan string...",
  "keyFindings": ["Brief finding 1", "Brief finding 2"]
}
`,
  config: {
    // Higher temperature for more creative/varied diet suggestions, but keep it reasonable.
    temperature: 0.5, 
  }
});

const aiDietPlanFlow = ai.defineFlow(
  {
    name: 'aiDietPlanFlow',
    inputSchema: AiDietPlanInputSchema,
    outputSchema: AiDietPlanOutputSchema,
  },
  async (input) => {
    // In a real scenario, you might want to add image pre-processing or OCR here if the model struggles.
    // For now, we directly pass the image to the multimodal model.
    const {output} = await dietPrompt(input);
    
    if (!output) {
        throw new Error("The AI model did not return a valid diet plan.");
    }
    return output;
  }
);
