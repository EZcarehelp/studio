"use client";

import type { Doctor } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShieldCheck, MapPin, CalendarDays, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { PriceDisplay } from './price-display'; // Assuming PriceDisplay is created
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";


interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const { toast } = useToast();

  const handleBookAppointment = () => {
    // Mock booking action
    console.log(`Booking appointment with ${doctor.name}`);
    toast({
      title: "Appointment Requested",
      description: `Your request to book an appointment with ${doctor.name} has been sent.`,
      variant: "default", // Or use a success variant if defined
    });
  };
  
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 card-gradient flex flex-col h-full">
      <CardHeader className="p-0 relative">
        <Image
          src={doctor.imageUrl}
          alt={doctor.name}
          width={400}
          height={250}
          className="object-cover w-full h-48"
          data-ai-hint="doctor portrait"
        />
        {doctor.isVerified && (
          <Badge variant="default" className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white">
            <ShieldCheck className="w-4 h-4 mr-1" /> Verified
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl mb-1">{doctor.name}</CardTitle>
        <p className="text-primary font-medium text-sm mb-2">{doctor.specialty}</p>
        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" /> {doctor.rating} ({doctor.experience} yrs exp)
        </div>
        {doctor.location && (
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPin className="w-4 h-4 mr-1" /> {doctor.location}
          </div>
        )}
        <PriceDisplay inr={doctor.consultationFee} className="text-lg font-semibold mb-2" />
        <Badge variant={doctor.availability === "Available Today" ? "secondary" : "outline"} className="text-xs">
          {doctor.availability}
        </Badge>
      </CardContent>
      <CardFooter className="p-4 grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={handleBookAppointment}>
          <CalendarDays className="w-4 h-4 mr-2" /> Book
        </Button>
        <Button asChild className="btn-premium">
          <Link href={`/patient/chats/new?doctorId=${doctor.id}`}> {/* Assuming a route to start new chat */}
            <MessageSquare className="w-4 h-4 mr-2" /> Chat
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
