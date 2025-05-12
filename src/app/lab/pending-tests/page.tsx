
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FlaskConical, Clock } from "lucide-react";

export default function PendingLabTestsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <Clock className="mr-3 h-7 w-7" />
            Pending Lab Tests
          </CardTitle>
          <CardDescription>
            View and manage lab tests that are awaiting processing or sample collection. This feature is under development.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <FlaskConical className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Pending Tests Feature Coming Soon</h3>
          <p className="text-muted-foreground">
            A list of all pending lab test requests will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
