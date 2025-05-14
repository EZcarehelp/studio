
import type { Medicine } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, LocateFixed } from 'lucide-react'; // Added LocateFixed
import { PriceDisplay } from './price-display';
import Link from 'next/link';

interface MedicineCardProps {
  medicine: Medicine;
}

export function MedicineCard({ medicine }: MedicineCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 card-gradient flex flex-col h-full rounded-lg">
      <CardHeader className="p-0">
        <Image
          src={medicine.imageUrl}
          alt={medicine.name}
          width={300}
          height={200} 
          className="object-contain w-full h-32 bg-white" 
          data-ai-hint={medicine.dataAiHint || "medicine product"}
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-base font-medium mb-1 line-clamp-1">{medicine.name}</CardTitle>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2 h-10">{medicine.description}</p> 
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" /> {medicine.rating}
        </div>
        <PriceDisplay inr={medicine.price} className="text-lg" />
      </CardContent>
      <CardFooter className="p-3 grid grid-cols-2 gap-2 border-t mt-auto"> 
        <Button variant="outline" size="sm" asChild className="rounded-md">
           <Link href={`/patient/store/nearby-pharmacies?medicine=${encodeURIComponent(medicine.name)}`}>
            <LocateFixed className="w-4 h-4 mr-1.5" /> Available Nearby
          </Link>
        </Button>
        <Button asChild className="w-full btn-premium rounded-md" size="sm">
          <a href={medicine.affiliateLink || '#'} target="_blank" rel="noopener noreferrer">
            <ShoppingCart className="w-4 h-4 mr-1.5" /> Buy Now
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
