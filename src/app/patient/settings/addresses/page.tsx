
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, PlusCircle, Trash2, Edit2, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Address } from "@/types";

const initialAddresses: Address[] = [
    { id: 'addr1', street: '123 Park Avenue, Apt 4B', city: 'Townsville', state: 'CA', zip: '90210', country: 'USA', isDefault: true },
    { id: 'addr2', street: '456 Work Drive, Suite 100', city: 'BizCity', state: 'NY', zip: '10001', country: 'USA', isDefault: false },
];

export default function PatientAddressesPage() {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [editingAddress, setEditingAddress] = useState<Address | null | Partial<Address>>(null); // null for no form, Address for editing, Partial for new

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
  };

  const handleAddNew = () => {
    setEditingAddress({ street: '', city: '', state: '', zip: '', country: 'USA', isDefault: false });
  };

  const handleSaveAddress = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingAddress) return;

    if ('id' in editingAddress && editingAddress.id) { // Editing existing
      setAddresses(prev => prev.map(addr => addr.id === editingAddress.id ? editingAddress as Address : addr));
      toast({ title: "Address Updated", variant: "success" });
    } else { // Adding new
      const newAddress: Address = { ...editingAddress, id: `addr${Date.now()}` } as Address;
      setAddresses(prev => [...prev, newAddress]);
      toast({ title: "Address Added", variant: "success" });
    }
    setEditingAddress(null);
  };
  
  const handleDelete = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
    toast({ title: "Address Deleted" });
  };

  const handleSetDefault = (id: string) => {
    setAddresses(prev => prev.map(addr => ({...addr, isDefault: addr.id === id })));
    toast({ title: "Default Address Set", variant: "success"});
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <MapPin className="mr-3 h-7 w-7" />
            Saved Addresses
          </CardTitle>
          <CardDescription>
            Manage your saved addresses for medicine deliveries and home sample collection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {addresses.map(addr => (
            <Card key={addr.id} className={`p-4 rounded-md ${addr.isDefault ? 'border-2 border-primary shadow-md' : 'border'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{addr.street}</p>
                  <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zip} - {addr.country}</p>
                  {addr.isDefault && <p className="text-xs text-primary font-medium mt-1">Default Address</p>}
                </div>
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(addr)}><Edit2 className="w-4 h-4 mr-1 sm:mr-2"/>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(addr.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4 mr-1 sm:mr-2"/>Delete</Button>
                </div>
              </div>
              {!addr.isDefault && (
                <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-primary" onClick={() => handleSetDefault(addr.id)}>
                  Set as Default
                </Button>
              )}
            </Card>
          ))}
          {!editingAddress && (
            <Button variant="outline" className="w-full mt-4" onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4"/> Add New Address
            </Button>
          )}
        </CardContent>
      </Card>

      {editingAddress && (
        <Card className="shadow-lg rounded-lg mt-6">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Home className="mr-2 h-6 w-6 text-primary"/> 
              {'id' in editingAddress && editingAddress.id ? 'Edit Address' : 'Add New Address'}
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSaveAddress}>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="street">Street Address</Label>
                <Input id="street" value={editingAddress.street || ''} onChange={e => setEditingAddress(prev => ({...prev, street: e.target.value}))} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={editingAddress.city || ''} onChange={e => setEditingAddress(prev => ({...prev, city: e.target.value}))} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="state">State/Province</Label>
                  <Input id="state" value={editingAddress.state || ''} onChange={e => setEditingAddress(prev => ({...prev, state: e.target.value}))} required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="zip">ZIP/Postal Code</Label>
                  <Input id="zip" value={editingAddress.zip || ''} onChange={e => setEditingAddress(prev => ({...prev, zip: e.target.value}))} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={editingAddress.country || 'USA'} onChange={e => setEditingAddress(prev => ({...prev, country: e.target.value}))} required />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Input 
                    type="checkbox" 
                    id="isDefault" 
                    checked={!!editingAddress.isDefault} 
                    onChange={e => setEditingAddress(prev => ({...prev, isDefault: e.target.checked}))} 
                    className="h-4 w-4"
                />
                <Label htmlFor="isDefault" className="font-normal">Set as default address</Label>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="btn-premium flex-grow">Save Address</Button>
                <Button type="button" variant="outline" onClick={() => setEditingAddress(null)} className="flex-grow">Cancel</Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}
    </div>
  );
}
