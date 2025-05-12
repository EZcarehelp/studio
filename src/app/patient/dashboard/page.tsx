// This page can redirect to the main home page for patients,
// or be a more personalized dashboard if needed.
// For now, let's make it a simple welcome page.

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, CalendarDays, FileText, MessageSquare, Search, Pill } from "lucide-react";

export default function PatientDashboardPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl text-gradient">Welcome to Your Dashboard</CardTitle>
          <CardDescription>Manage your health and appointments with EzCare Connect.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardActionCard
            title="Find Doctors"
            description="Search and book appointments."
            icon={<Search className="w-8 h-8 text-primary" />}
            href="/patient/find-doctors"
          />
          <DashboardActionCard
            title="My Appointments"
            description="View your upcoming and past appointments."
            icon={<CalendarDays className="w-8 h-8 text-primary" />}
            href="/patient/appointments"
          />
          <DashboardActionCard
            title="AI Symptom Checker"
            description="Get a preliminary analysis of your symptoms."
            icon={<MessageSquare className="w-8 h-8 text-primary" />}
            href="/ai-symptom-checker"
          />
          <DashboardActionCard
            title="Order Medicines"
            description="Browse and order medicines online."
            icon={<Pill className="w-8 h-8 text-primary" />}
            href="/patient/store"
          />
          <DashboardActionCard
            title="Medical Records"
            description="Access and manage your health records."
            icon={<FileText className="w-8 h-8 text-primary" />}
            href="/patient/medical-records"
          />
           <DashboardActionCard
            title="My Chats"
            description="View your conversations with doctors."
            icon={<MessageSquare className="w-8 h-8 text-primary" />}
            href="/patient/chats"
          />
        </CardContent>
      </Card>
    </div>
  );
}

interface DashboardActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

function DashboardActionCard({ title, description, icon, href }: DashboardActionCardProps) {
  return (
    <Link href={href} passHref>
      <Card className="hover:shadow-xl transition-shadow duration-300 transform hover:scale-105 cursor-pointer h-full">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <div className="p-2 bg-primary/10 rounded-full">{icon}</div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
