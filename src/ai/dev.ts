import { config } from 'dotenv';
config(); // Load .env variables

import '@/ai/flows/ai-symptom-analysis.ts';
import '@/ai/flows/ai-diet-plan-flow.ts';
import '@/ai/flows/ai-ayurvedic-remedy-flow.ts';
import '@/ai/flows/fetch-health-news-flow.ts'; // Added new news flow
