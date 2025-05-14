
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import type { NewsArticle } from "@/types";
import { Rss, ExternalLink, CalendarDays, Loader2, AlertTriangle } from "lucide-react";
import { format } from 'date-fns';
import { fetchHealthNews, type FetchHealthNewsInput } from '@/ai/flows/fetch-health-news-flow';

export default function HealthNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const input: FetchHealthNewsInput = { category: 'health', country: 'us', pageSize: 12 }; // Or 'in' for India, etc.
        const result = await fetchHealthNews(input);
        setArticles(result.articles);
      } catch (err) {
        console.error("Failed to fetch health news:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred while fetching news.");
      } finally {
        setIsLoading(false);
      }
    };

    loadNews();
  }, []);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-3xl text-gradient flex items-center">
            <Rss className="mr-3 h-8 w-8" />
            Health News Feed
          </CardTitle>
          <CardDescription>
            Stay updated with the latest news and breakthroughs in health and medicine.
            {/* Removed conditional warnings based on NEXT_PUBLIC_NEWS_API_KEY_IS_PLACEHOLDER */}
          </CardDescription>
        </CardHeader>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-3 text-lg text-muted-foreground">Loading health news...</p>
        </div>
      )}

      {error && (
        <Card className="border-destructive bg-destructive/10 rounded-lg">
          <CardHeader className="flex flex-row items-center gap-2">
             <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle className="text-destructive">Error Fetching News</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <p className="text-sm text-destructive/80 mt-2">
              This might be due to an issue with the NewsAPI service, your internet connection, or the API key. 
              Please try again later.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && articles.length === 0 && (
        <Card className="text-center py-12 col-span-full rounded-lg bg-muted/50">
          <CardContent>
            <Rss className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No News Articles Found</h3>
            <p className="text-muted-foreground">
              We couldn't find any health news articles at the moment. This might be due to API issues or no recent news.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Card key={article.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 card-gradient rounded-lg transform hover:scale-102">
              <div className="relative w-full h-48">
                <Image
                  src={article.imageUrl || "https://placehold.co/600x400.png"}
                  alt={article.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  data-ai-hint={article.dataAiHint || "health news"}
                  onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400.png")} // Fallback for broken images
                />
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold line-clamp-2 h-14">{article.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{article.snippet || "No snippet available."}</p>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-2 pt-3 border-t">
                <div className="flex justify-between w-full text-xs text-muted-foreground">
                  <span>{article.sourceName}</span>
                  <span className="flex items-center">
                    <CalendarDays className="mr-1 h-3.5 w-3.5" />
                    {format(new Date(article.publishedAt), "MMM d, yyyy")}
                  </span>
                </div>
                <Button variant="link" asChild className="p-0 h-auto text-primary hover:text-secondary">
                  <Link href={article.articleUrl} target="_blank" rel="noopener noreferrer">
                    Read More <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
       <p className="text-sm text-center text-muted-foreground mt-8">
        News articles are provided for informational purposes. Content is sourced from external news providers.
      </p>
    </div>
  );
}
