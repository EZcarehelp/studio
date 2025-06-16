
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <FileText className="mr-3 h-7 w-7" />
            Terms and Conditions
          </CardTitle>
          <CardDescription>
            Please read our terms and conditions carefully.
          </CardDescription>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none py-6">
          <h2>1. Introduction</h2>
          <p>Welcome to EzCare Simplified. These are the terms and conditions governing your access to and use of the EzCare Simplified platform and its associated services.</p>
          
          <h2>2. Acceptance of Terms</h2>
          <p>By using our services, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, then you may not access the service.</p>

          <h2>3. Services Provided</h2>
          <p>EzCare Simplified provides a platform for patients to connect with doctors, schedule appointments, manage health records, and access other health-related services. Some services, like medicine purchases, are facilitated through third-party affiliate partners.</p>

          <h2>4. User Accounts</h2>
          <p>To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>

          <h2>5. Doctor Verification</h2>
          <p>We strive to verify the credentials of doctors on our platform. However, EzCare Simplified is not responsible for the professional services provided by the doctors. The doctor-patient relationship is solely between the patient and the doctor.</p>

          <h2>6. AI Symptom Checker</h2>
          <p>The AI Symptom Checker tool is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult with a qualified healthcare professional for any health concerns.</p>

          <h2>7. Limitation of Liability</h2>
          <p>EzCare Simplified will not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.</p>
          
          <h2>8. Changes to Terms</h2>
          <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms and Conditions on this page.</p>

          <h2>9. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at support@ezcaresimplified.com.</p>

          <p className="text-sm text-muted-foreground mt-8">Last updated: July 14, 2024</p>
        </CardContent>
      </Card>
    </div>
  );
}
