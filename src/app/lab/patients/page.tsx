
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function LabPatientsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <Users className="mr-3 h-7 w-7" />
            Manage Patients (Lab Records)
          </CardTitle>
          <CardDescription>
            View patient records associated with your lab. This feature is under development.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Users className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Patient Management Feature Coming Soon</h3>
          <p className="text-muted-foreground">
            You will be able to view patient history and lab results processed by your lab here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
