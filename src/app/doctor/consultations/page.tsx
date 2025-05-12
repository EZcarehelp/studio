
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, DollarSign } from "lucide-react";

export default function DoctorConsultationsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <Settings className="mr-3 h-7 w-7" />
            Consultation Settings
          </CardTitle>
          <CardDescription>
            Manage your consultation fees, availability, and other related settings. This feature is under development.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <DollarSign className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Consultation Settings Coming Soon</h3>
          <p className="text-muted-foreground">
            Detailed settings for your consultations will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
