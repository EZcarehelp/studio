
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function LabWorkerNotificationsPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <Bell className="mr-3 h-7 w-7" />
            Notification Settings (Lab)
          </CardTitle>
          <CardDescription>
            Manage your notification preferences for lab-related activities. This feature is under development.
            (Toggles for new test requests, critical results, report uploads, etc., would go here).
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Bell className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Notification Settings Coming Soon</h3>
          <p className="text-muted-foreground">
            Customize how and when you receive notifications for new test requests, critical results, etc.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
