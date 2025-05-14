
'use server';
/**
 * @fileOverview A flow to fetch health news articles from NewsAPI.org.
 *
 * - fetchHealthNews - Fetches health news articles.
 * - FetchHealthNewsInput - Input for fetching news (e.g., category, count).
 * - FetchHealthNewsOutput - Output containing the list of articles.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { NewsArticle } from '@/types';

const NEWS_API_BASE_URL = 'https://newsapi.org/v2/top-headlines';

const FetchHealthNewsInputSchema = z.object({
  category: z.string().default('health').describe('The category of news to fetch.'),
  country: z.string().default('us').describe('The country to fetch news for (e.g., "us", "in").'),
  pageSize: z.number().default(12).describe('Number of articles to fetch.'),
});
export type FetchHealthNewsInput = z.infer<typeof FetchHealthNewsInputSchema>;

const NewsArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  snippet: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  sourceName: z.string(),
  publishedAt: z.string(),
  articleUrl: z.string(),
  dataAiHint: z.string().optional(),
}) satisfies z.ZodType<NewsArticle>;

const FetchHealthNewsOutputSchema = z.object({
  articles: z.array(NewsArticleSchema).describe('A list of health news articles.'),
});
export type FetchHealthNewsOutput = z.infer<typeof FetchHealthNewsOutputSchema>;

export async function fetchHealthNews(input: FetchHealthNewsInput): Promise<FetchHealthNewsOutput> {
  return fetchHealthNewsFlow(input);
}

const fetchHealthNewsFlow = ai.defineFlow(
  {
    name: 'fetchHealthNewsFlow',
    inputSchema: FetchHealthNewsInputSchema,
    outputSchema: FetchHealthNewsOutputSchema,
  },
  async (input) => {
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      console.error('NEWS_API_KEY is not configured. Please add it to your .env.local file.');
      // Return empty or mock data to prevent app crash during development if key is missing
      // Or throw an error if preferred:
      // throw new Error('NEWS_API_KEY is not configured.');
      return { articles: [
        {
            id: "mock-news-1",
            title: "API Key Missing: Showing Mock Article 1",
            snippet: "Please configure your NEWS_API_KEY in a .env.local file to fetch live news. This is a placeholder.",
            imageUrl: "https://placehold.co/600x400.png",
            sourceName: "EzCare System",
            publishedAt: new Date().toISOString(),
            articleUrl: "#",
            dataAiHint: "configuration warning"
        },
        {
            id: "mock-news-2",
            title: "API Key Missing: Showing Mock Article 2",
            snippet: "Visit NewsAPI.org to get a free API key for development purposes. Add it as NEWS_API_KEY in .env.local.",
            imageUrl: "https://placehold.co/600x400.png",
            sourceName: "EzCare System",
            publishedAt: new Date().toISOString(),
            articleUrl: "#",
            dataAiHint: "news placeholder"
        }
      ]};
    }

    const url = `${NEWS_API_BASE_URL}?category=${input.category}&country=${input.country}&pageSize=${input.pageSize}&apiKey=${apiKey}&language=en`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        console.error(`NewsAPI request failed with status ${response.status}:`, errorData.message || response.statusText);
        throw new Error(`Failed to fetch news: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();

      if (data.status !== 'ok') {
        throw new Error(`NewsAPI returned an error: ${data.message || 'Unknown error'}`);
      }

      const articles: NewsArticle[] = (data.articles || []).map((article: any, index: number) => ({
        id: article.url || `news-${index}-${Date.now()}`, // Use URL as ID or generate one
        title: article.title || 'No title available',
        snippet: article.description || '',
        imageUrl: article.urlToImage || 'https://placehold.co/600x400.png',
        sourceName: article.source?.name || 'Unknown Source',
        publishedAt: article.publishedAt || new Date().toISOString(),
        articleUrl: article.url || '#',
        dataAiHint: 'health news' // generic hint
      }));

      return { articles };
    } catch (error) {
      console.error('Error fetching or processing news:', error);
      // Depending on desired behavior, could return empty articles or re-throw
      // For robustness in UI, returning empty or mock might be better than crashing
      throw new Error(`Error in fetchHealthNewsFlow: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
);
