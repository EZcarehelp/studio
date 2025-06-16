
"use client"; // Added this directive

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, CalendarDays, FileText, MessageSquare, Search, Pill, Heart, Footprints, Bed, Brain, Leaf, ShieldAlert } from "lucide-react";
import { HealthStatCard } from "@/components/patient/health-stat-card";
import type { AyurvedicRemedy } from "@/types";
import { AyurvedicRemedyCard } from "@/components/patient/ayurvedic-remedy-card"; // Assuming this path
import { useState } from "react"; // Required for managing remedy state if done locally
import React from 'react';


// Mock data for Ayurvedic remedies to display on dashboard
const featuredRemedies: AyurvedicRemedy[] = [
  { id: 'dash-remedy1', name: 'Tulsi Tea for Immunity', type: 'herbal', tags: ['immunity', 'cold', 'wellness'], description: 'A simple tea to boost overall immunity and fight common colds.', ingredients: ['5-7 Tulsi (Holy Basil) leaves', '1 cup Water', '1/2 tsp Honey (optional)'], preparation: 'Boil Tulsi leaves in water for 5-7 minutes. Strain and add honey if desired.', usage: 'Drink once or twice daily.', imageUrl: 'https://placehold.co/400x300.png',dataAiHint: "tulsi tea", isFavorite: false },
  { id: 'dash-remedy2', name: 'Fennel Seed Water for Digestion', type: 'digestion', tags: ['digestion', 'bloating', 'refreshing'], description: 'Aids digestion and helps reduce bloating. Acts as a mouth freshener.', ingredients: ['1 tsp Fennel Seeds', '1 cup Hot Water'], preparation: 'Steep fennel seeds in hot water for 5-10 minutes. Strain and drink warm or at room temperature.', usage: 'Sip after meals for best results.', imageUrl: 'https://placehold.co/400x300.png', dataAiHint: "fennel water", isFavorite: false },
];


export default function PatientDashboardPage() {
  // State for featured remedies if save functionality is handled locally on dashboard
  const [currentFeaturedRemedies, setCurrentFeaturedRemedies] = useState<AyurvedicRemedy[]>(featuredRemedies);

  const handleDashboardRemedySaveToggle = (remedyId: string) => {
    setCurrentFeaturedRemedies(prevRemedies =>
      prevRemedies.map(r =>
        r.id === remedyId ? { ...r, isFavorite: !r.isFavorite } : r
      )
    );
  };
  
  return (
    <div className="space-y-8">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gradient">Welcome to Your Health Dashboard</CardTitle>
          <CardDescription>Manage your health, appointments, and explore wellness tips with EzCare Simplified.</CardDescription>
        </CardHeader>
      </Card>

      {/* Health Statistics Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-foreground/90">Your Health Vitals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <HealthStatCard
            title="Heart Rate"
            value="72"
            unit="bpm"
            Icon={Heart}
            iconColorClass="text-red-500"
            footerText="Last checked: Today, 9 AM"
          />
          <HealthStatCard
            title="Steps Today"
            value="6,540"
            goal="10,000 steps"
            progressValue={65}
            Icon={Footprints}
            iconColorClass="text-blue-500"
          />
          <HealthStatCard
            title="Sleep Last Night"
            value="7h 30m"
            goal="8h goal"
            progressValue={93} // (7.5 / 8) * 100
            Icon={Bed}
            iconColorClass="text-purple-500"
          />
        </div>
      </section>
      
      {/* AI Suggestion Card */}
       <Card className="shadow-lg rounded-lg bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-0.5">
        <div className="bg-card rounded-[0.45rem] p-6">
            <CardHeader className="p-0 pb-3 flex flex-row items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-primary to-secondary rounded-md">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-xl text-gradient">AI Health Insight</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-foreground/90">
                Based on your recent activity, consider a 15-minute brisk walk post-lunch. It can aid digestion and contribute significantly to your daily step goal!
              </p>
              <Button variant="link" className="px-0 pt-2 text-primary hover:text-secondary">Learn More</Button>
            </CardContent>
          </div>
      </Card>


      {/* Quick Actions Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-foreground/90">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
          <DashboardActionCard title="Find Doctors" description="Search & book." icon={<Search />} href="/patient/find-doctors" />
          <DashboardActionCard title="My Appointments" description="View schedule." icon={<CalendarDays />} href="/patient/appointments" />
          <DashboardActionCard title="EzCare Chatbot" description="Preliminary analysis." icon={<MessageSquare />} href="/ai-symptom-checker" />
          <DashboardActionCard title="Order Medicines" description="Browse store." icon={<Pill />} href="/patient/store" />
          <DashboardActionCard title="Medical Records" description="Access records." icon={<FileText />} href="/patient/medical-records" />
          <DashboardActionCard title="Ayurvedic Remedies" description="Natural wellness." icon={<Leaf />} href="/patient/ayurvedic-remedies" />
        </div>
      </section>

      {/* Featured Ayurvedic Remedies Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-foreground/90">Featured Ayurvedic Remedies</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/patient/ayurvedic-remedies">View All</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentFeaturedRemedies.map(remedy => (
            <AyurvedicRemedyCard key={remedy.id} remedy={remedy} onSaveToggle={handleDashboardRemedySaveToggle} />
          ))}
        </div>
      </section>

       {/* Disclaimer for AI features */}
      <Card className="mt-8 border-blue-200 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-900/30 rounded-lg">
        <CardHeader className="flex flex-row items-center gap-3 pb-3">
          <ShieldAlert className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <CardTitle className="text-blue-700 dark:text-blue-300 text-base">Important Note on AI Features</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-600 dark:text-blue-300/90">
            The AI-powered suggestions and analyses provided by EzCare Simplified, including the EzCare Chatbot and diet plans, are for informational purposes only. They do not constitute medical advice, diagnosis, or treatment. Always consult with a qualified healthcare professional for any health concerns or before making any decisions related to your health or treatment.
          </p>
        </CardContent>
      </Card>

    </div>
  );
}

interface DashboardActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode; // Accepts LucideIcon component
  href: string;
}

function DashboardActionCard({ title, description, icon, href }: DashboardActionCardProps) {
  return (
    <Link href={href} passHref>
      <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer h-full card-gradient group">
        <CardContent className="pt-5 pb-5 flex flex-col items-center text-center justify-center h-full">
          <div className="p-3 bg-primary/10 rounded-full mb-2.5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
            {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6 md:w-7 md:h-7" })}
          </div>
          <h3 className="text-base md:text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
