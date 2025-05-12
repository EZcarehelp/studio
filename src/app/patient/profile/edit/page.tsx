
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserCircle } from "lucide-react";

export default function PatientProfileEditPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <UserCircle className="mr-3 h-7 w-7" />
            Edit Personal Information
          </CardTitle>
          <CardDescription>
            Update your personal details. This feature is under development.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <UserCircle className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Profile Editing Coming Soon</h3>
          <p className="text-muted-foreground">
            You will be able to update your name, contact information, and other personal details here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
