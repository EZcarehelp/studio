
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export default function PatientAppointmentsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <CalendarDays className="mr-3 h-7 w-7" />
            My Appointments
          </CardTitle>
          <CardDescription>
            View your upcoming and past appointments. This feature is under development.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <CalendarDays className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Appointments Feature Coming Soon</h3>
          <p className="text-muted-foreground">
            You will be able to manage all your doctor appointments here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
