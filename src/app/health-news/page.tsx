
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import type { NewsArticle } from "@/types";
import { Rss, ExternalLink, CalendarDays } from "lucide-react";
import { format } from 'date-fns'; // For formatting dates

// Mock News Data
const mockNewsArticles: NewsArticle[] = [
  {
    id: "news1",
    title: "Breakthrough in AI-Powered Diagnostics for Early Cancer Detection",
    snippet: "Researchers have developed a new AI model that shows promising results in identifying early-stage cancers from medical imaging, potentially revolutionizing diagnostic processes.",
    imageUrl: "https://placehold.co/600x400.png",
    sourceName: "HealthTech Today",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Yesterday
    articleUrl: "#",
    dataAiHint: "medical technology"
  },
  {
    id: "news2",
    title: "The Impact of Sleep Quality on Mental Wellbeing: New Study Findings",
    snippet: "A comprehensive study highlights the critical link between consistent, high-quality sleep and overall mental health, offering insights into preventative measures for stress and anxiety.",
    imageUrl: "https://placehold.co/600x400.png",
    sourceName: "Wellness Journal",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    articleUrl: "#",
    dataAiHint: "person sleeping"
  },
  {
    id: "news3",
    title: "Global Health Initiative Launched to Combat Antibiotic Resistance",
    snippet: "International health organizations have joined forces to launch a new initiative aimed at tackling the growing threat of antibiotic resistance through research and public awareness campaigns.",
    imageUrl: "https://placehold.co/600x400.png",
    sourceName: "Global Health News",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    articleUrl: "#",
    dataAiHint: "laboratory research"
  },
  {
    id: "news4",
    title: "Nutritional Psychiatry: How Your Diet Affects Your Mental Health",
    snippet: "Experts explore the emerging field of nutritional psychiatry, emphasizing the connection between food choices, gut health, and mental wellness. Learn which foods can boost your mood.",
    imageUrl: "https://placehold.co/600x400.png",
    sourceName: "Mind & Body Magazine",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    articleUrl: "#",
    dataAiHint: "healthy food"
  }
];


export default function HealthNewsPage() {
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
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockNewsArticles.map((article) => (
          <Card key={article.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 card-gradient rounded-lg transform hover:scale-102">
            <div className="relative w-full h-48">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                style={{ objectFit: 'cover' }}
                data-ai-hint={article.dataAiHint || "news article"}
              />
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold line-clamp-2 h-14">{article.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground line-clamp-3">{article.snippet}</p>
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
       <p className="text-sm text-center text-muted-foreground mt-8">
        News articles are provided for informational purposes. Content is sourced from various external news providers.
      </p>
    </div>
  );
}
