
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function PatientPaymentsPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <CreditCard className="mr-3 h-7 w-7" />
            Payment Methods
          </CardTitle>
          <CardDescription>
            Manage your saved payment methods. This feature is under development.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <CreditCard className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Payment Management Coming Soon</h3>
          <p className="text-muted-foreground">
            Securely add, edit, or remove your payment methods here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
