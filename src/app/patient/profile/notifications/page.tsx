
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function PatientNotificationsPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <Bell className="mr-3 h-7 w-7" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Manage your notification preferences. This feature is under development.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Bell className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Notification Settings Coming Soon</h3>
          <p className="text-muted-foreground">
            Customize how and when you receive notifications from EzCare Connect.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
