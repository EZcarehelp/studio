
"use client";

import type { AyurvedicRemedy, RemedyType } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Eye, MessageSquare, ThumbsUp, Leaf } from 'lucide-react'; // Added Eye, MessageSquare, ThumbsUp
import Image from 'next/image';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AyurvedicRemedyCardProps {
  remedy: AyurvedicRemedy & { views?: number; saves?: number }; // Added views and saves
  onSaveToggle?: (remedyId: string) => void;
  onReadMore?: (remedy: AyurvedicRemedy) => void; // Placeholder for read more action
}

export function AyurvedicRemedyCard({ remedy, onSaveToggle, onReadMore }: AyurvedicRemedyCardProps) {
  const [isFavorite, setIsFavorite] = useState(remedy.isFavorite || false);
  const { toast } = useToast();

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    if (onSaveToggle) {
      onSaveToggle(remedy.id);
    }
    toast({
      title: newFavoriteState ? "Remedy Saved!" : "Remedy Unsaved",
      description: `${remedy.name} has been ${newFavoriteState ? 'added to' : 'removed from'} your favorites.`,
      variant: newFavoriteState ? "success" : "default",
    });
  };

  const handleCardClick = () => {
    if (onReadMore) {
      onReadMore(remedy);
    } else {
      // Fallback or default action if onReadMore is not provided
      console.log("Read more for:", remedy.name);
       toast({ title: "Details Coming Soon", description: `Full details for ${remedy.name} will be available in a modal view.`});
    }
  };

  return (
    <Card 
        className="shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full rounded-lg overflow-hidden transform hover:scale-102 bg-card cursor-pointer"
        onClick={handleCardClick}
    >
      {remedy.imageUrl && (
        <div className="relative w-full h-48"> {/* Increased height for image */}
          <Image 
            src={remedy.imageUrl} 
            alt={remedy.name} 
            fill
            style={{ objectFit: 'cover' }}
            data-ai-hint={remedy.dataAiHint || "herbal remedy"}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Optimize image loading
          />
        </div>
      )}
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg font-semibold mb-0.5 line-clamp-2">{remedy.name}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground line-clamp-1">
          {remedy.type.charAt(0).toUpperCase() + remedy.type.slice(1)} Remedy
          {remedy.tags && remedy.tags.length > 0 && ` • ${remedy.tags.slice(0,2).join(', ')}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-1 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{remedy.description}</p>
      </CardContent>
      <CardFooter className="p-3 border-t bg-muted/30">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <div className="flex items-center space-x-3">
                 <Button variant="ghost" size="icon" onClick={handleSaveClick} className="h-7 w-7 p-0 hover:bg-primary/10">
                    <Heart className={cn("w-4 h-4", isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground hover:text-primary")} />
                    <span className="sr-only">Save</span>
                </Button>
                 <Button variant="ghost" size="icon" className="h-7 w-7 p-0 hover:bg-primary/10">
                    <Eye className="w-4 h-4 text-muted-foreground hover:text-primary" />
                    <span className="sr-only">Read More</span>
                </Button>
                 {/* Mock counts for views/saves like recipe site */}
                {remedy.views !== undefined && (
                    <span className="flex items-center">
                        <ThumbsUp className="w-3.5 h-3.5 mr-1"/> {remedy.views}
                    </span>
                )}
                {remedy.saves !== undefined && (
                    <span className="flex items-center">
                        <Heart className="w-3.5 h-3.5 mr-1"/> {remedy.saves}
                    </span>
                )}
            </div>
            <Leaf className="w-4 h-4 text-green-600" /> 
        </div>
      </CardFooter>
    </Card>
  );
}
