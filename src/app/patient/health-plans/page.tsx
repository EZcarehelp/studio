
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function PatientHealthPlansPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <ShieldCheck className="mr-3 h-7 w-7" />
            Health Plans
          </CardTitle>
          <CardDescription>
            Explore and compare various health insurance plans. This feature is under development.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <ShieldCheck className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Health Plans Feature Coming Soon</h3>
          <p className="text-muted-foreground">
            Find the best health coverage options tailored to your needs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
