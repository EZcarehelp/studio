
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, BarChart3, PieChart, Users, FileText, Activity } from "lucide-react";
// Placeholder for actual chart components if you integrate a library like Recharts or Chart.js
// import { Line, Bar, Pie } from 'recharts'; 
// For now, we'll use placeholder divs for charts.

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <LineChart className="mr-3 h-7 w-7" />
            Platform Analytics
          </CardTitle>
          <CardDescription>
            Visualize key metrics and trends for EzCare Simplified. (Charts are placeholders)
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Daily Active Users (DAU)</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Placeholder for Line Chart */}
            <div className="h-64 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
              Line Chart: DAU Over Time
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center"><FileText className="mr-2 h-5 w-5 text-primary"/>Reports Uploaded / Lab Tests Booked</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Placeholder for Bar Chart */}
            <div className="h-64 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
              Bar Chart: Report Uploads vs Lab Bookings
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center"><PieChart className="mr-2 h-5 w-5 text-primary"/>User Type Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          {/* Placeholder for Pie Chart */}
          <div className="h-64 w-64 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
            Pie Chart: User Roles
          </div>
        </CardContent>
      </Card>
      
       <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center"><Activity className="mr-2 h-5 w-5 text-primary"/>System Health & Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Average API Response Time: <span className="text-foreground font-medium">120ms</span></li>
            <li>Uptime (Last 24h): <span className="text-foreground font-medium">99.98%</span></li>
            <li>Database Connections: <span className="text-foreground font-medium">Normal</span></li>
            <li>Background Job Queue: <span className="text-foreground font-medium">Low</span></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

    