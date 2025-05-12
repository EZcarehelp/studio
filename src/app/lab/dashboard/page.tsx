
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, FlaskConical, Upload, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LabDashboardPage() {
  const quickActions = [
    { title: "View Pending Tests", description: "See tests awaiting processing.", icon: <FlaskConical className="w-8 h-8 text-primary" />, href: "/lab/pending-tests", count: 5 },
    { title: "Upload Reports", description: "Upload completed lab reports.", icon: <Upload className="w-8 h-8 text-primary" />, href: "/lab/reports/upload" },
    { title: "Manage Patients (Mock)", description: "View patient records associated with lab.", icon: <Users className="w-8 h-8 text-primary" />, href: "/lab/patients" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gradient">Lab Worker Dashboard</h1>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map(action => (
            <Link href={action.href} key={action.title} passHref>
              <Card className="hover:shadow-xl transition-shadow duration-300 transform hover:scale-105 cursor-pointer card-gradient h-full">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="p-3 bg-primary/10 rounded-full">{action.icon}</div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                  {action.count !== undefined && (
                     <p className="text-2xl font-bold text-primary mt-2">{action.count} <span className="text-sm font-normal text-muted-foreground">pending</span></p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

       <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Overview of recent uploads and test statuses.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recent activity to display yet.</p>
          {/* This would list recent report uploads, critical value alerts, etc. */}
        </CardContent>
      </Card>

    </div>
  );
}
