
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PharmacyListItem } from '@/components/patient/pharmacy-list-item';
import type { Pharmacy } from '@/types';
import { MapIcon, Filter, Loader2, AlertTriangle, LocateFixed, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const mockPharmacies: Pharmacy[] = [
  { id: 'pharma1', name: 'MedLife Chemist Central', address: '123 Health St, MedCity', distance: '0.5 km', stockStatus: 'in-stock', deliveryTime: '30 min', pickupAvailable: true, timings: '9 AM - 10 PM', imageUrl: 'https://placehold.co/100x100.png', dataAiHint: "pharmacy storefront", latitude: 12.9716, longitude: 77.5946 },
  { id: 'pharma2', name: 'Apollo Pharmacy Downtown', address: '456 Wellness Ave, MedCity', distance: '1.2 km', stockStatus: 'limited-stock', deliveryTime: '1 hr', pickupAvailable: true, timings: '24x7', imageUrl: 'https://placehold.co/100x100.png', dataAiHint: "pharmacy building", latitude: 12.9760, longitude: 77.5900 },
  { id: 'pharma3', name: 'Wellness Meds Eastside', address: '789 Cure Rd, MedCity', distance: '2.3 km', stockStatus: 'out-of-stock', pickupAvailable: false, timings: '10 AM - 8 PM (Closed Sun)', imageUrl: 'https://placehold.co/100x100.png', dataAiHint: "pharmacy sign", latitude: 12.9616, longitude: 77.6146 },
  { id: 'pharma4', name: 'QuickCare Pharma', address: '101 Speedy Ln, MedCity', distance: '0.8 km', stockStatus: 'in-stock', deliveryTime: 'ASAP', pickupAvailable: true, timings: '8 AM - 11 PM', imageUrl: 'https://placehold.co/100x100.png', dataAiHint: "modern pharmacy", latitude: 12.9800, longitude: 77.5980 },
];

export default function NearbyPharmaciesPage() {
  const searchParams = useSearchParams();
  const medicineName = searchParams.get('medicine') || 'your selected medicine'; // Get medicine name from query
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapView, setMapView] = useState(false); // For future map toggle

  useEffect(() => {
    // Simulate fetching pharmacies based on medicine name and user location
    setIsLoading(true);
    setError(null);
    // In a real app, you'd call an API here, possibly passing user's lat/lon and medicineName
    setTimeout(() => {
      // For now, just use mock data, maybe filter it if medicineName was specific
      setPharmacies(mockPharmacies);
      setIsLoading(false);
    }, 1500);
  }, [medicineName]);

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" asChild className="rounded-full">
          <Link href="/patient/store">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Store</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gradient text-center flex-grow">
          Nearby Pharmacies
        </h1>
        <div className="w-10"></div> {/* Spacer */}
      </div>


      <Card className="shadow-md rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <LocateFixed className="mr-2 h-5 w-5 text-primary"/>
            Pharmacies with <span className="font-semibold text-primary mx-1">{medicineName}</span> near you
          </CardTitle>
          <CardDescription>
            Showing pharmacies based on mock location data. Filters and map view are placeholders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button variant="outline" size="sm" className="rounded-md">
              <Filter className="mr-1.5 h-4 w-4" /> Filter
            </Button>
            <Button variant="outline" size="sm" className="rounded-md">Open Now</Button>
            <Button variant="outline" size="sm" className="rounded-md">Has Delivery</Button>
            <Button variant="outline" size="sm" className="rounded-md">Closest First</Button>
             <Button variant={mapView ? "default" : "outline"} size="sm" onClick={() => setMapView(!mapView)} className="rounded-md ml-auto">
              <MapIcon className="mr-1.5 h-4 w-4" /> {mapView ? "List View" : "Map View"}
            </Button>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="ml-3 text-md text-muted-foreground">Finding pharmacies...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p className="font-medium">Error finding pharmacies</p>
              <p className="text-sm opacity-90 mt-1">{error}</p>
            </div>
          )}

          {!isLoading && !error && pharmacies.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
                <LocateFixed className="h-12 w-12 mx-auto mb-3" />
                <p className="text-lg">No pharmacies found for this medicine nearby.</p>
                <p className="text-sm">Try a different medicine or check back later.</p>
            </div>
          )}

          {!isLoading && !error && pharmacies.length > 0 && !mapView && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pharmacies.map(pharmacy => (
                <PharmacyListItem key={pharmacy.id} pharmacy={pharmacy} />
              ))}
            </div>
          )}
           {!isLoading && !error && pharmacies.length > 0 && mapView && (
            <Card className="text-center py-12 bg-muted/30 rounded-lg h-96 flex flex-col justify-center items-center">
                <MapIcon className="h-24 w-24 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Map View Placeholder</h3>
                <p className="text-muted-foreground">Interactive map will be displayed here.</p>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
