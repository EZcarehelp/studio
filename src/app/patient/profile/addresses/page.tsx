
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function PatientAddressesPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <MapPin className="mr-3 h-7 w-7" />
            Saved Addresses
          </CardTitle>
          <CardDescription>
            Manage your saved addresses for deliveries and services. This feature is under development.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <MapPin className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Address Management Coming Soon</h3>
          <p className="text-muted-foreground">
            Add, edit, or remove your saved addresses here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
