
"use client";

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import type { NewsArticle } from "@/types";
import { Rss, ExternalLink, CalendarDays, Loader2, AlertTriangle } from "lucide-react";
import { format } from 'date-fns';
import { fetchHealthNews, type FetchHealthNewsInput } from '@/ai/flows/fetch-health-news-flow';
import { cn } from '@/lib/utils';

const DEFAULT_PLACEHOLDER_IMAGE_URL = 'https://placehold.co/600x400.png';
const FALLBACK_IMAGE_URL = 'https://placehold.co/800x500.png'; // General fallback for onError

export default function HealthNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(format(new Date(), "MMMM d, yyyy"));
    const loadNews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const input: FetchHealthNewsInput = { category: 'health', country: 'us', pageSize: 20 }; // Fetch 20 articles
        const result = await fetchHealthNews(input);
        
        // Filter articles to only include those with a valid imageUrl (not the default placeholder)
        const articlesWithImages = result.articles.filter(
          article => article.imageUrl && article.imageUrl !== DEFAULT_PLACEHOLDER_IMAGE_URL
        );
        setArticles(articlesWithImages);

      } catch (err) {
        console.error("Failed to fetch health news:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred while fetching news.");
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadNews();
  }, []);

  const leadArticle = articles.length > 0 ? articles[0] : null;
  const secondaryArticles = articles.slice(1, 3); 
  const remainingArticles = articles.slice(3); 

  return (
    <div className="font-sans bg-background text-foreground dark:bg-slate-900 dark:text-slate-100 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-screen-xl">
        {/* Masthead */}
        <header className="text-center border-b-2 border-foreground dark:border-slate-700 pb-4 mb-6">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground dark:text-slate-100">EzCare Health News</h1>
          <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1">Your Daily Dose of Health Insights & Discoveries</p>
          <p className="text-xs text-muted-foreground dark:text-slate-500 mt-2">{currentDate} - Health Edition | Global & Local</p>
        </header>

        {isLoading && (
          <div className="flex flex-col justify-center items-center py-20 text-center" role="status" aria-live="polite">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground dark:text-slate-400">Loading Latest Health News...</p>
          </div>
        )}

        {error && (
          <div className="border-destructive dark:border-red-700 bg-destructive/10 dark:bg-red-900/20 rounded-lg p-6 my-10" role="alert">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive dark:text-red-400" />
              <div>
                <h2 className="text-xl font-semibold text-destructive dark:text-red-400">Failed to Load News</h2>
                <p className="text-destructive/80 dark:text-red-400/80 mt-1">{error}</p>
                <p className="text-sm text-destructive/70 dark:text-red-400/70 mt-2">
                  Please check your internet connection or try again later.
                </p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && articles.length === 0 && (
          <div className="text-center py-20 text-muted-foreground dark:text-slate-400">
            <Rss className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No News Articles Found</h3>
            <p>We couldn't find any health news articles with images at the moment.</p>
          </div>
        )}

        {!isLoading && !error && articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-8">
            {/* Lead Article */}
            {leadArticle && leadArticle.imageUrl && leadArticle.imageUrl !== DEFAULT_PLACEHOLDER_IMAGE_URL && (
              <article className="md:col-span-8 lg:col-span-9 space-y-2 pb-6 border-b md:border-b-0 md:border-r md:pr-6 border-foreground/20 dark:border-slate-700">
                <div className="relative w-full h-64 md:h-80 mb-3 rounded overflow-hidden shadow">
                  <Image
                    src={leadArticle.imageUrl}
                    alt={leadArticle.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    data-ai-hint={leadArticle.dataAiHint || "news event"}
                    onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE_URL)}
                    priority
                  />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground dark:text-slate-100 hover:text-primary dark:hover:text-blue-400 transition-colors">
                  <Link href={leadArticle.articleUrl} target="_blank" rel="noopener noreferrer">
                    {leadArticle.title}
                  </Link>
                </h2>
                <p className="text-base text-muted-foreground dark:text-slate-300 leading-relaxed">
                  {leadArticle.snippet || "No summary available."}
                </p>
                <div className="text-xs text-muted-foreground dark:text-slate-400 pt-1">
                  <span>By {leadArticle.sourceName}</span> | <span className="ml-1">{format(new Date(leadArticle.publishedAt), "MMM d, yyyy")}</span>
                  <Link href={leadArticle.articleUrl} target="_blank" rel="noopener noreferrer" className="text-primary dark:text-blue-400 hover:underline ml-2 font-medium">
                    Read More <ExternalLink className="inline h-3 w-3 ml-0.5" />
                  </Link>
                </div>
              </article>
            )}

            {/* Secondary Articles Column */}
            {secondaryArticles.length > 0 && (
              <aside className="md:col-span-4 lg:col-span-3 space-y-6">
                {secondaryArticles.map((article) => (
                  article.imageUrl && article.imageUrl !== DEFAULT_PLACEHOLDER_IMAGE_URL && (
                    <article key={article.id} className="pb-4 border-b border-foreground/20 dark:border-slate-700 last:border-b-0">
                      <h3 className="text-lg font-semibold font-serif text-foreground dark:text-slate-100 hover:text-primary dark:hover:text-blue-400 transition-colors">
                        <Link href={article.articleUrl} target="_blank" rel="noopener noreferrer">
                          {article.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground dark:text-slate-300 leading-snug mt-1 line-clamp-3">
                        {article.snippet || "No summary available."}
                      </p>
                      <div className="text-xs text-muted-foreground dark:text-slate-400 mt-1.5">
                        <span>By {article.sourceName}</span> | <span className="ml-1">{format(new Date(article.publishedAt), "MMM d, yyyy")}</span>
                        <Link href={article.articleUrl} target="_blank" rel="noopener noreferrer" className="text-primary dark:text-blue-400 hover:underline ml-2 text-xs">
                          Full Story <ExternalLink className="inline h-2.5 w-2.5 ml-0.5" />
                        </Link>
                      </div>
                    </article>
                  )
                ))}
              </aside>
            )}
          </div>
        )}
        
        {/* Remaining Articles (if any) */}
        {!isLoading && !error && remainingArticles.length > 0 && (
          <section className="mt-8 pt-6 border-t border-foreground/20 dark:border-slate-700">
             <h3 className="text-2xl font-serif font-semibold mb-4 text-foreground dark:text-slate-200">More Health News</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {remainingArticles.map((article) => (
                article.imageUrl && article.imageUrl !== DEFAULT_PLACEHOLDER_IMAGE_URL && (
                  <article key={article.id} className="space-y-1 pb-3 border-b border-foreground/10 dark:border-slate-700/50 last:border-b-0">
                    <div className="relative w-full h-40 mb-2 rounded overflow-hidden shadow-sm">
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        data-ai-hint={article.dataAiHint || "news illustration"}
                        onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE_URL)}
                      />
                    </div>
                    <h4 className="text-md font-semibold font-serif text-foreground dark:text-slate-100 hover:text-primary dark:hover:text-blue-400 transition-colors">
                      <Link href={article.articleUrl} target="_blank" rel="noopener noreferrer">
                          {article.title}
                        </Link>
                    </h4>
                    <p className="text-sm text-muted-foreground dark:text-slate-300 leading-tight line-clamp-2">
                      {article.snippet || "No summary available."}
                    </p>
                    <div className="text-xs text-muted-foreground dark:text-slate-400 pt-0.5">
                      <span>By {article.sourceName}</span> | <span className="ml-1">{format(new Date(article.publishedAt), "MMM d, yyyy")}</span>
                        <Link href={article.articleUrl} target="_blank" rel="noopener noreferrer" className="text-primary dark:text-blue-400 hover:underline ml-2 text-xs">
                          Read <ExternalLink className="inline h-2.5 w-2.5 ml-0.5" />
                        </Link>
                    </div>
                  </article>
                )
              ))}
            </div>
          </section>
        )}

        <footer className="mt-12 pt-6 border-t border-foreground/20 dark:border-slate-700">
          <p className="text-xs text-center text-muted-foreground dark:text-slate-400">
            News articles are provided for informational purposes. Content is sourced from external news providers.
            EzCare Health News is not responsible for the content of external sites.
          </p>
        </footer>
      </div>
    </div>
  );
}
