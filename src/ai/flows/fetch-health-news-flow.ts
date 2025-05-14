
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
const HARDCODED_NEWS_API_KEY = 'a0e02dc03c7d474bba442959c6d1a262';

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
    const apiKey = HARDCODED_NEWS_API_KEY; // API Key is now hardcoded

    // The check for a missing/placeholder API key and returning mock data is removed.
    // If the hardcoded key is invalid or there are other issues, the fetch will fail.

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
