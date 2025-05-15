
import { config } from 'dotenv';
config(); // Load .env variables

// import '@/ai/flows/ai-symptom-analysis.ts'; // Old import - ensure this is commented or removed if symptom analysis is merged
import '@/ai/flows/ez-care-chatbot-flow.ts'; // New combined chatbot flow
import '@/ai/flows/ai-diet-plan-flow.ts';
import '@/ai/flows/ai-ayurvedic-remedy-flow.ts';
import '@/ai/flows/fetch-health-news-flow.ts';
