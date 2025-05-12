
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function DoctorReportsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <BarChart3 className="mr-3 h-7 w-7" />
            Your Reports
          </CardTitle>
          <CardDescription>
            View analytics and reports related to your practice. This feature is under development.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <BarChart3 className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Reports Coming Soon</h3>
          <p className="text-muted-foreground">
            We are working on providing you with insightful reports and analytics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
