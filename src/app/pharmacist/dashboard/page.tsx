
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, ListOrdered, Pill, Settings } from "lucide-react";
import Link from "next/link";

export default function PharmacistDashboardPage() {
  const quickActions = [
    { title: "Manage Orders", description: "View and process incoming medicine orders.", icon: <ListOrdered className="w-8 h-8 text-primary" />, href: "/pharmacist/orders" },
    { title: "Inventory Management", description: "Update stock levels and medicine details.", icon: <Pill className="w-8 h-8 text-primary" />, href: "/pharmacist/inventory" },
    { title: "Account Settings", description: "Manage your pharmacy profile and settings.", icon: <Settings className="w-8 h-8 text-primary" />, href: "/pharmacist/settings" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gradient">Pharmacist Dashboard</h1>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Welcome, Pharmacist!</CardTitle>
            <CardDescription>This is your central hub for managing pharmacy operations.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Key statistics and alerts will be shown here soon.</p>
          </CardContent>
        </Card>
      </section>

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
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

       <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Overview of recent orders and stock updates.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recent activity to display yet.</p>
        </CardContent>
      </Card>

    </div>
  );
}
