
"use client";

import type { Pharmacy, StockStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, Truck, Clock, CheckCircle, AlertCircle, XCircle, ShoppingCart, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PharmacyListItemProps {
  pharmacy: Pharmacy;
}

const stockStatusIcons: Record<StockStatus, React.ElementType> = {
  'in-stock': CheckCircle,
  'limited-stock': AlertCircle,
  'out-of-stock': XCircle,
};

const stockStatusColors: Record<StockStatus, string> = {
  'in-stock': 'text-green-600 dark:text-green-400',
  'limited-stock': 'text-yellow-600 dark:text-yellow-400',
  'out-of-stock': 'text-red-600 dark:text-red-400',
};

const stockStatusBgColors: Record<StockStatus, string> = {
  'in-stock': 'bg-green-100 dark:bg-green-700/30',
  'limited-stock': 'bg-yellow-100 dark:bg-yellow-700/30',
  'out-of-stock': 'bg-red-100 dark:bg-red-700/30',
}

export function PharmacyListItem({ pharmacy }: PharmacyListItemProps) {
  const StockIcon = stockStatusIcons[pharmacy.stockStatus];

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow rounded-lg overflow-hidden card-gradient">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
            {pharmacy.imageUrl && (
                 <div className="relative w-12 h-12 shrink-0">
                    <Image 
                        src={pharmacy.imageUrl} 
                        alt={pharmacy.name} 
                        fill 
                        style={{objectFit: 'cover'}} 
                        className="rounded-md"
                        data-ai-hint={pharmacy.dataAiHint || "pharmacy storefront"}
                    />
                </div>
            )}
           {!pharmacy.imageUrl && <Store className="w-8 h-8 text-primary shrink-0" />}
            <CardTitle className="text-lg font-semibold">{pharmacy.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5 text-sm">
        <div className="flex items-center text-muted-foreground">
          <MapPin className="w-4 h-4 mr-2 shrink-0" />
          <span>{pharmacy.distance} away</span>
          {pharmacy.timings && <span className="mx-1.5">·</span>}
          {pharmacy.timings && <Clock className="w-4 h-4 mr-1 shrink-0" />}
          {pharmacy.timings && <span>{pharmacy.timings}</span>}
        </div>
        
        <div className={cn("flex items-center p-2 rounded-md text-xs font-medium", stockStatusBgColors[pharmacy.stockStatus], stockStatusColors[pharmacy.stockStatus])}>
          <StockIcon className="w-4 h-4 mr-2 shrink-0" />
          {pharmacy.stockStatus === 'in-stock' && 'In Stock'}
          {pharmacy.stockStatus === 'limited-stock' && 'Limited Stock'}
          {pharmacy.stockStatus === 'out-of-stock' && 'Out of Stock'}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {pharmacy.deliveryTime && (
            <span className="flex items-center">
              <Truck className="w-3.5 h-3.5 mr-1 text-primary" /> Delivery: {pharmacy.deliveryTime}
            </span>
          )}
          <span className="flex items-center">
            {pharmacy.pickupAvailable ? <CheckCircle className="w-3.5 h-3.5 mr-1 text-green-500" /> : <XCircle className="w-3.5 h-3.5 mr-1 text-red-500" />}
            Pickup Available
          </span>
        </div>
        
      </CardContent>
      <div className="p-4 border-t mt-3 grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="rounded-md" disabled={pharmacy.stockStatus === 'out-of-stock'}>
            <ShoppingCart className="w-4 h-4 mr-1.5" /> Order Now
          </Button>
          <Button variant="ghost" size="sm" className="rounded-md">
            <MapPin className="w-4 h-4 mr-1.5" /> View on Map
          </Button>
        </div>
    </Card>
  );
}
