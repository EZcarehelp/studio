import type { Medicine } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ExternalLink } from 'lucide-react';
import { PriceDisplay } from './price-display'; // Assuming PriceDisplay is created

interface MedicineCardProps {
  medicine: Medicine;
}

export function MedicineCard({ medicine }: MedicineCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 card-gradient flex flex-col h-full">
      <CardHeader className="p-0">
        <Image
          src={medicine.imageUrl}
          alt={medicine.name}
          width={300}
          height={200}
          className="object-contain w-full h-40 bg-white" // bg-white for better visibility of product images
          data-ai-hint="medicine product"
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg mb-1 line-clamp-2">{medicine.name}</CardTitle>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{medicine.description}</p>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" /> {medicine.rating}
        </div>
        <PriceDisplay inr={medicine.price} className="text-md font-semibold" />
      </CardContent>
      <CardFooter className="p-4">
        <Button asChild className="w-full btn-premium">
          <a href={medicine.affiliateLink || '#'} target="_blank" rel="noopener noreferrer">
            Buy Now <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
