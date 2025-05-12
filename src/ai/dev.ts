import { config } from 'dotenv';
config();

import '@/ai/flows/ai-symptom-analysis.ts';
import '@/ai/flows/ai-diet-plan-flow.ts'; // Added new flow
import '@/ai/flows/ai-ayurvedic-remedy-flow.ts'; // Added Ayurvedic remedy flow
