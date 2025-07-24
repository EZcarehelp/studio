
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Stethoscope, Search, Users, MessageSquare, Activity, ShieldCheck, FileText, Pill, FlaskConical, BookHeart, Star } from "lucide-react";
import Image from 'next/image';
import Link from "next/link";
import { DoctorCard } from '@/components/shared/doctor-card'; 
import type { Doctor } from '@/types'; 
import { getDoctors } from "@/lib/firebase/firestore";

const popularSearches = [
  { name: "Dentist", icon: <Stethoscope className="w-5 h-5 mr-2" /> },
  { name: "Gynecologist", icon: <Users className="w-5 h-5 mr-2" /> },
  { name: "Dermatologist", icon: <Activity className="w-5 h-5 mr-2" /> },
  { name: "Cardiologist", icon: <BookHeart className="w-5 h-5 mr-2" /> },
];

const services = [
  { title: "Find Doctors", description: "Book appointments with verified doctors.", icon: <Search className="w-10 h-10 text-primary" />, href: "/patient/find-doctors" },
  { title: "Medicines", description: "Order medicines online (Coming Soon).", icon: <Pill className="w-10 h-10 text-primary" />, href: "/patient/store" },
  { title: "Lab Tests", description: "Book lab tests at home or centers.", icon: <FlaskConical className="w-10 h-10 text-primary" />, href: "/patient/lab-tests" },
  { title: "Health Records", description: "Manage your health records securely.", icon: <FileText className="w-10 h-10 text-primary" />, href: "/patient/medical-records" },
  { title: "Health Plans", description: "Explore various health plans.", icon: <ShieldCheck className="w-10 h-10 text-primary" />, href: "/patient/health-plans" },
  { title: "EzCare Chatbot", description: "Get AI-powered symptom analysis.", icon: <MessageSquare className="w-10 h-10 text-primary" />, href: "/ai-symptom-checker" },
];

export default async function HomePage() {
  const allDoctors = await getDoctors();
  // Filter for verified doctors and take the first 3 to feature
  const featuredDoctors = allDoctors.filter(doctor => doctor.isVerified).slice(0, 3);

  return (
    <div className="space-y-12 md:space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 rounded-xl shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Your Health, <span className="text-gradient">Simplified.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with trusted doctors, order medicines, and manage your health all in one place with EzCare Simplified.
          </p>
          {/* Search bar and Find Doctors button removed from here */}
        </div>
      </section>

      {/* Popular Searches */}
      <section>
        <h2 className="text-2xl font-semibold mb-2 text-center md:text-left">Popular Searches</h2>
        <p className="text-muted-foreground mb-6 text-center md:text-left">Quickly find doctors by common specialties.</p>
        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          {popularSearches.map((search) => (
            <Button key={search.name} variant="outline" className="bg-accent/50 hover:bg-accent">
              {search.icon} {search.name}
            </Button>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-2 text-center">Our Services</h2>
        <p className="text-muted-foreground mb-6 text-center">Comprehensive healthcare solutions at your fingertips.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link href={service.href} key={service.title} passHref>
              <Card className="card-gradient hover:shadow-xl transition-shadow duration-300 transform hover:scale-105 cursor-pointer h-full flex flex-col">
                <CardHeader className="items-center text-center">
                  <div className="p-3 bg-primary/10 rounded-full mb-3 inline-block">
                    {service.icon}
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center flex-grow">
                  <CardDescription>{service.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-2 text-center">Meet Our Doctors</h2>
        <p className="text-muted-foreground mb-6 text-center">Consult with experienced and verified healthcare professionals.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDoctors.length > 0 ? (
            featuredDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))
          ) : (
             <p className="text-muted-foreground text-center col-span-full">No verified doctors available at the moment. Please check back later.</p>
          )}
        </div>
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" asChild>
            <Link href="/patient/find-doctors">View All Doctors</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
