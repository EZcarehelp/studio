"use client";

import type { AyurvedicRemedy, RemedyType } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Leaf, Sprout, Flame, Droplets, Zap, Info } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AyurvedicRemedyCardProps {
  remedy: AyurvedicRemedy;
  onSaveToggle?: (remedyId: string) => void; // Optional: if save state is managed externally
}

const remedyTypeStyles: Record<RemedyType, { bg: string; text: string; icon: React.ElementType }> = {
  herbal: { bg: 'bg-remedy-herbal', text: 'text-remedy-herbal-foreground', icon: Leaf },
  digestion: { bg: 'bg-remedy-digestion', text: 'text-remedy-digestion-foreground', icon: Sprout },
  inflammation: { bg: 'bg-remedy-inflammation', text: 'text-remedy-inflammation-foreground', icon: Flame },
  calming: { bg: 'bg-remedy-calming', text: 'text-remedy-calming-foreground', icon: Droplets },
  general: { bg: 'bg-remedy-general', text: 'text-remedy-general-foreground', icon: Zap },
};

export function AyurvedicRemedyCard({ remedy, onSaveToggle }: AyurvedicRemedyCardProps) {
  const [isFavorite, setIsFavorite] = useState(remedy.isFavorite || false);
  const { toast } = useToast();

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click if any
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

  const typeStyle = remedyTypeStyles[remedy.type] || remedyTypeStyles.general;
  const IconComponent = typeStyle.icon;

  return (
    <Card className={cn("shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full rounded-lg overflow-hidden transform hover:scale-102", typeStyle.bg)}>
      {remedy.imageUrl && (
        <div className="relative w-full h-40">
          <Image 
            src={remedy.imageUrl} 
            alt={remedy.name} 
            layout="fill" 
            objectFit="cover" 
            data-ai-hint="remedy herb"
          />
        </div>
      )}
      <CardHeader className={cn("pb-3", typeStyle.text)}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold mb-1">{remedy.name}</CardTitle>
            <CardDescription className={cn("text-xs uppercase tracking-wider font-medium opacity-80", typeStyle.text)}>
              <IconComponent className="inline-block w-3.5 h-3.5 mr-1.5 mb-0.5" />
              {remedy.type} Remedy
            </CardDescription>
          </div>
           <Button variant="ghost" size="icon" onClick={handleSaveClick} className={cn("ml-auto rounded-full hover:bg-white/20", typeStyle.text)}>
            <Heart className={cn("w-5 h-5 transition-colors", isFavorite ? "fill-destructive text-destructive" : typeStyle.text)} />
            <span className="sr-only">Save remedy</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className={cn("flex-grow space-y-3 text-sm leading-relaxed", typeStyle.text, remedy.imageUrl ? "pt-3" : "")}>
        <p className="opacity-90">{remedy.description}</p>
        
        {remedy.ingredients && remedy.ingredients.length > 0 && (
          <div>
            <h4 className="font-semibold mb-1 text-base opacity-95">Ingredients:</h4>
            <ul className="list-disc list-inside pl-1 space-y-0.5 text-xs opacity-80">
              {remedy.ingredients.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </div>
        )}
        {remedy.preparation && (
          <div>
            <h4 className="font-semibold mb-1 text-base opacity-95">Preparation:</h4>
            <p className="text-xs opacity-80 whitespace-pre-line">{remedy.preparation}</p>
          </div>
        )}
         {remedy.usage && (
          <div>
            <h4 className="font-semibold mb-1 text-base opacity-95">Usage:</h4>
            <p className="text-xs opacity-80 whitespace-pre-line">{remedy.usage}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className={cn("pt-3 pb-3 border-t mt-auto", typeStyle.text, `border-${typeStyle.text}/20`)}>
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-wrap gap-1">
            {remedy.tags.slice(0,3).map(tag => (
              <Badge key={tag} variant="outline" className={cn("text-xs border-opacity-50", typeStyle.text, `border-${typeStyle.text}/40 bg-white/10`)}>
                {tag}
              </Badge>
            ))}
          </div>
          {remedy.source && (
            <a href={remedy.source} target="_blank" rel="noopener noreferrer" className={cn("text-xs hover:underline opacity-70 hover:opacity-100", typeStyle.text)}>
              <Info className="inline w-3 h-3 mr-1" /> More Info
            </a>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
