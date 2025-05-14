
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, IndianRupee, Tag, Wallet, PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { PaymentMethod } from "@/types";

const initialPaymentMethods: PaymentMethod[] = [
    { id: 'pm1', type: 'card', last4: '1234', expiry: '12/25', isDefault: true },
    { id: 'pm2', type: 'upi', last4: 'user@upi', isDefault: false }
];

export default function PatientPaymentsPage() {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods);
  const [showAddForm, setShowAddForm] = useState(false);
  // Add states for new payment method form

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev => prev.map(pm => ({...pm, isDefault: pm.id === id })));
    toast({ title: "Default Payment Method Set", variant: "success" });
  };
  
  const handleDeleteMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
    toast({ title: "Payment Method Removed", variant: "default" });
  };


  // Placeholder for form submission
  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to add new payment method
    toast({ title: "New Payment Method Added (Mock)", variant: "success"});
    setShowAddForm(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <CreditCard className="mr-3 h-7 w-7" />
            Payments &amp; Billing
          </CardTitle>
          <CardDescription>
            Manage your saved payment methods, view invoice history, and apply promo codes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
            {/* Saved Payment Methods */}
            <div className="space-y-3 p-4 border rounded-md shadow-sm">
                <h3 className="font-semibold text-lg flex items-center"><CreditCard className="w-5 h-5 mr-2 text-primary"/>Saved Payment Methods</h3>
                {paymentMethods.length > 0 ? paymentMethods.map(pm => (
                    <div key={pm.id} className={`p-3 border rounded-md flex justify-between items-center ${pm.isDefault ? 'bg-primary/10 border-primary' : ''}`}>
                        <div>
                            <p className="font-medium">{pm.type === 'card' ? `Card ending in **** ${pm.last4}` : `UPI: ${pm.last4}`}</p>
                            {pm.type === 'card' && <p className="text-xs text-muted-foreground">Expires: {pm.expiry}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                            {!pm.isDefault && (
                                <Button variant="ghost" size="sm" onClick={() => handleSetDefault(pm.id)}>Set as Default</Button>
                            )}
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleDeleteMethod(pm.id)}><Trash2 className="w-4 h-4"/></Button>
                        </div>
                    </div>
                )) : <p className="text-sm text-muted-foreground">No saved payment methods.</p>}
                
                <Button variant="outline" className="w-full mt-2" onClick={() => setShowAddForm(!showAddForm)}>
                    <PlusCircle className="mr-2 h-4 w-4"/> Add New Payment Method
                </Button>

                {showAddForm && (
                    <form onSubmit={handleAddPaymentMethod} className="mt-4 space-y-3 p-3 border-t">
                        <h4 className="font-medium">Add New Card (Mock Form)</h4>
                        <Input placeholder="Card Number" type="text" required/>
                        <Input placeholder="MM/YY" type="text" required/>
                        <Input placeholder="CVC" type="text" required/>
                        <Button type="submit" className="w-full">Add Card</Button>
                    </form>
                )}
            </div>

            {/* Invoice History */}
            <div className="p-4 border rounded-md shadow-sm bg-muted/20">
                <h3 className="font-semibold text-lg flex items-center"><IndianRupee className="w-5 h-5 mr-2 text-primary"/>Invoice History</h3>
                <p className="text-sm text-muted-foreground mt-2 text-center py-3">
                    Your invoice history for appointments and tests will be available here. (Feature coming soon)
                </p>
            </div>
            
            {/* Promo Codes & Wallet */}
             <div className="space-y-3 p-4 border rounded-md shadow-sm">
                <h3 className="font-semibold text-lg flex items-center"><Tag className="w-5 h-5 mr-2 text-primary"/>Promo Codes</h3>
                <div className="flex gap-2">
                    <Input placeholder="Enter promo code"/>
                    <Button>Apply</Button>
                </div>
                 <p className="text-xs text-muted-foreground">Apply promo codes for discounts on services.</p>
            </div>
             <div className="p-4 border rounded-md shadow-sm bg-muted/20">
                <h3 className="font-semibold text-lg flex items-center"><Wallet className="w-5 h-5 mr-2 text-primary"/>Wallet / Cashback</h3>
                <p className="text-sm text-muted-foreground mt-2 text-center py-3">
                    Track your wallet balance or cashback rewards. (Feature coming soon)
                </p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
