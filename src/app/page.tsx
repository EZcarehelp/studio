
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Stethoscope, Search, Users, MessageSquare, Activity, ShieldCheck, FileText, Pill, FlaskConical, BookHeart, Star } from "lucide-react";
import Image from 'next/image';
import Link from "next/link";
import { DoctorCard } from '@/components/shared/doctor-card'; 
import type { Doctor } from '@/types'; 

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

const featuredDoctors: Doctor[] = [
  { id: "1", name: "Dr. Alice Smith", specialty: "Cardiologist", experience: 10, rating: 4.8, consultationFee: 1500, availability: "Available Today", imageUrl: "https://placehold.co/400x250.png", isVerified: true, location: "New York, NY", dataAiHint: "doctor portrait" },
  { id: "2", name: "Dr. Bob Johnson", specialty: "Dermatologist", experience: 7, rating: 4.5, consultationFee: 1200, availability: "Next 3 days", imageUrl: "https://placehold.co/400x250.png", isVerified: true, location: "London, UK", dataAiHint: "doctor portrait" },
  { id: "3", name: "Dr. Carol Williams", specialty: "Pediatrician", experience: 12, rating: 4.9, consultationFee: 1000, availability: "Available Today", imageUrl: "https://placehold.co/400x250.png", isVerified: true, location: "Mumbai, MH", dataAiHint: "doctor portrait" },
];

const testimonials = [
  { name: "Sarah L.", feedback: "EzCare Connect made finding a specialist so easy! The appointment booking was seamless.", avatarUrl: "https://placehold.co/100x100.png", rating: 5, dataAiHint: "user avatar" },
  { name: "John B.", feedback: "The EzCare Chatbot gave me some helpful pointers before I consulted a doctor. Great platform!", avatarUrl: "https://placehold.co/100x100.png", rating: 4, dataAiHint: "user avatar" },
  { name: "Priya K.", feedback: "I love having all my health needs in one place. Highly recommend EzCare!", avatarUrl: "https://placehold.co/100x100.png", rating: 5, dataAiHint: "user avatar" },
];


export default function HomePage() {
  return (
    <div className="space-y-12 md:space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 rounded-xl shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Your Health, <span className="text-gradient">Simplified.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with trusted doctors, order medicines, and manage your health all in one place with EzCare Connect.
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
          {featuredDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" asChild>
            <Link href="/patient/find-doctors">View All Doctors</Link>
          </Button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="pb-8">
        <h2 className="text-2xl font-semibold mb-2 text-center">What Our Patients Say</h2>
        <p className="text-muted-foreground mb-6 text-center">Real stories from satisfied users of EzCare Connect.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="shadow-lg card-gradient">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Image 
                    src={testimonial.avatarUrl} 
                    alt={testimonial.name} 
                    width={48} 
                    height={48} 
                    className="rounded-full mr-4"
                    data-ai-hint={testimonial.dataAiHint} 
                  />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <div className="flex text-yellow-500">
                      {Array(testimonial.rating).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                      {Array(5 - testimonial.rating).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 text-muted-foreground" />)}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground italic">"{testimonial.feedback}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
