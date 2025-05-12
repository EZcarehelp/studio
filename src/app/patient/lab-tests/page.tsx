
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FlaskConical } from "lucide-react";

export default function PatientLabTestsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <FlaskConical className="mr-3 h-7 w-7" />
            Lab Tests
          </CardTitle>
          <CardDescription>
            Book lab tests at home or at certified centers. This feature is under development.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <FlaskConical className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Lab Tests Booking Coming Soon</h3>
          <p className="text-muted-foreground">
            Conveniently book a wide range of lab tests from trusted partners.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
