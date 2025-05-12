
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <HelpCircle className="mr-3 h-7 w-7" />
            Help & Support
          </CardTitle>
          <CardDescription>
            Find answers to your questions or contact our support team.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <HelpCircle className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Support Center Coming Soon</h3>
          <p className="text-muted-foreground">
            Our comprehensive FAQ and support contact options will be available here shortly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
