
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function PatientMedicalRecordsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <FileText className="mr-3 h-7 w-7" />
            Medical Records
          </CardTitle>
          <CardDescription>
            Access and manage your health records securely. This feature is under development.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <FileText className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Medical Records Feature Coming Soon</h3>
          <p className="text-muted-foreground">
            Securely store and access your medical history, prescriptions, and lab reports here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
