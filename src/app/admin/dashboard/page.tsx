
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, LineChart, FileSpreadsheet, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Mock data for admin dashboard
const adminStats = [
  { title: "Pending Approvals", value: "5", icon: <UserCheck className="w-6 h-6 text-primary" />, description: "Doctors/Labs awaiting review" },
  { title: "Total Users", value: "1,250", icon: <Users className="w-6 h-6 text-primary" />, description: "Patients, Doctors, Labs" },
  { title: "Flagged Accounts", value: "2", icon: <ShieldAlert className="w-6 h-6 text-destructive" />, description: "Accounts needing attention" },
  { title: "System Health", value: "Optimal", icon: <LineChart className="w-6 h-6 text-green-500" />, description: "All services operational" },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gradient">Admin Dashboard</CardTitle>
          <CardDescription>Welcome, Admin! Overview of EzCare Simplified platform.</CardDescription>
        </CardHeader>
      </Card>

      <section>
        <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminStats.map(stat => (
            <Card key={stat.title} className="shadow-md hover:shadow-lg transition-shadow card-gradient">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AdminActionCard title="Approve Requests" href="/admin/approvals" icon={<UserCheck />} description="Review new Doctor/Lab registrations."/>
          <AdminActionCard title="Manage Users" href="/admin/users" icon={<Users />} description="View, ban, or manage existing users."/>
          <AdminActionCard title="View System Logs" href="/admin/logs" icon={<FileSpreadsheet />} description="Monitor platform activity and errors."/>
        </div>
      </section>
      
       <Card>
        <CardHeader>
            <CardTitle>Recent Platform Activity</CardTitle>
            <CardDescription>Summary of important events (placeholder).</CardDescription>
        </CardHeader>
        <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
                <li>[Placeholder] Dr. NewDoc signed up - awaiting approval.</li>
                <li>[Placeholder] Lab XYZ applied for registration - awaiting approval.</li>
                <li>[Placeholder] User @TroubleMaker reported for spam.</li>
            </ul>
            <Button variant="link" asChild className="mt-2 px-0"><Link href="/admin/logs">View all activity</Link></Button>
        </CardContent>
      </Card>

    </div>
  );
}

interface AdminActionCardProps {
  title: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

function AdminActionCard({ title, href, icon, description }: AdminActionCardProps) {
  return (
    <Link href={href} passHref>
      <Card className="hover:shadow-xl transition-shadow duration-300 transform hover:scale-105 cursor-pointer card-gradient h-full flex flex-col">
        <CardHeader className="items-center text-center pb-3">
           <div className="p-3 bg-primary/10 rounded-full mb-2 text-primary">
            {React.cloneElement(icon as React.ReactElement, { className: "w-8 h-8"})}
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-xs text-muted-foreground flex-grow">
            <p>{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

    