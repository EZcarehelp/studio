import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, MessageSquare, Settings, DollarSign, BarChart3 } from "lucide-react";
import Link from "next/link";

const overviewStats = [
  { title: "Today's Appointments", value: "12", icon: <CalendarDays className="w-6 h-6 text-primary" />, change: "+2", changeType: "positive" },
  { title: "Total Patients", value: "156", icon: <Users className="w-6 h-6 text-primary" />, change: "+5 this week", changeType: "positive" },
  { title: "New Messages", value: "8", icon: <MessageSquare className="w-6 h-6 text-primary" />, change: "unread", changeType: "neutral" },
  { title: "Monthly Earnings", value: "₹75,000", icon: <DollarSign className="w-6 h-6 text-primary" />, change: "+5%", changeType: "positive" },
];


export default function DoctorDashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gradient">Doctor Dashboard</h1>
      
      {/* Overview Cards */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {overviewStats.map(stat => (
            <Card key={stat.title} className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : stat.changeType === 'negative' ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ActionCard title="Manage Schedule" href="/doctor/schedule" icon={<CalendarDays className="w-8 h-8 text-primary"/>} />
          <ActionCard title="View Patients" href="/doctor/patients" icon={<Users className="w-8 h-8 text-primary"/>} />
          <ActionCard title="Check Messages" href="/doctor/chats" icon={<MessageSquare className="w-8 h-8 text-primary"/>} />
          <ActionCard title="Update Profile" href="/doctor/profile" icon={<Settings className="w-8 h-8 text-primary"/>} />
          <ActionCard title="Consultation Settings" href="/doctor/consultations" icon={<DollarSign className="w-8 h-8 text-primary"/>} />
           <ActionCard title="View Reports" href="/doctor/reports" icon={<BarChart3 className="w-8 h-8 text-primary"/>} />
        </div>
      </section>

      {/* Recent Activity (Placeholder) */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No recent activity to display yet.</p>
            {/* In a real app, this would list recent appointments, messages, etc. */}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

interface ActionCardProps {
  title: string;
  href: string;
  icon: React.ReactNode;
}

function ActionCard({ title, href, icon }: ActionCardProps) {
  return (
    <Link href={href} passHref>
      <Card className="hover:shadow-xl transition-shadow duration-300 transform hover:scale-105 cursor-pointer card-gradient">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <div className="p-3 bg-primary/10 rounded-full mb-3">
            {icon}
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </CardContent>
      </Card>
    </Link>
  );
}
