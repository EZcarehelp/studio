
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search, Filter, UserX, Eye, ShieldAlert, ShieldCheck, Ban, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type UserRoleAdminView = 'patient' | 'doctor' | 'lab_worker' | 'admin';
type UserStatusAdminView = 'active' | 'pending_approval' | 'suspended' | 'banned';

interface ManagedUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRoleAdminView;
  status: UserStatusAdminView;
  lastLogin: string; // Date string or 'N/A'
  notes?: string; // For admin notes
}

const mockUsersData: ManagedUser[] = [
  { id: 'u1', name: 'John Patient', username: 'johnp', email: 'john.patient@example.com', role: 'patient', status: 'active', lastLogin: '2024-07-13' },
  { id: 'u2', name: 'Dr. Emily Carter', username: 'dremily', email: 'emily.carter@ezcare.com', role: 'doctor', status: 'active', lastLogin: '2024-07-14' },
  { id: 'u3', name: 'LabTech Leo', username: 'lab_leo', email: 'leo.lab@ezcare.com', role: 'lab_worker', status: 'active', lastLogin: '2024-07-12' },
  { id: 'u4', name: 'Dr. New Applicant', username: 'newdoc', email: 'new.doc@example.com', role: 'doctor', status: 'pending_approval', lastLogin: 'N/A' },
  { id: 'u5', name: 'Suspended User', username: 'suspendme', email: 'suspend@example.com', role: 'patient', status: 'suspended', lastLogin: '2024-07-01', notes: 'Spam activity reported.' },
  { id: 'u6', name: 'Banned User', username: 'banneduser', email: 'banned@example.com', role: 'patient', status: 'banned', lastLogin: '2024-06-01', notes: 'Multiple violations.' },
  { id: 'u7', name: 'Pending Lab Inc.', username: 'pendinglab', email: 'info@pendinglab.com', role: 'lab_worker', status: 'pending_approval', lastLogin: 'N/A' },
  { id: 'u8', name: 'Admin User', username: 'ezcareadmin', email: 'ezcarehelp@gmail.com', role: 'admin', status: 'active', lastLogin: '2024-07-15' },
];

export default function AdminManageUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<ManagedUser[]>(mockUsersData);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRoleAdminView | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatusAdminView | 'all'>('all');

  const filteredUsers = users.filter(user => {
    const termMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const roleMatch = roleFilter === 'all' || user.role === roleFilter;
    const statusMatch = statusFilter === 'all' || user.status === statusFilter;
    return termMatch && roleMatch && statusMatch;
  });

  const handleStatusChange = (userId: string, newStatus: UserStatusAdminView, actionVerb: string) => {
    setUsers(prevUsers => prevUsers.map(user => user.id === userId ? { ...user, status: newStatus } : user));
    const userName = users.find(u => u.id === userId)?.name;
    toast({
      title: `User ${actionVerb}`,
      description: `${userName || 'User'}'s status changed to ${newStatus.replace('_', ' ')}.`,
      variant: (newStatus === 'banned' || newStatus === 'suspended') ? "destructive" : "success",
    });
  };

  const getStatusBadge = (status: UserStatusAdminView) => {
    switch (status) {
      case 'active': return <Badge variant="default" className="bg-green-100 text-green-700 border-green-400 dark:bg-green-700/30 dark:text-green-300 dark:border-green-600"><CheckCircle className="mr-1 h-3 w-3"/>Active</Badge>;
      case 'pending_approval': return <Badge variant="outline" className="text-yellow-600 border-yellow-400 bg-yellow-50 dark:text-yellow-400 dark:border-yellow-600 dark:bg-yellow-700/20"><ShieldAlert className="mr-1 h-3 w-3"/>Pending</Badge>;
      case 'suspended': return <Badge variant="destructive" className="bg-orange-100 text-orange-700 border-orange-400 dark:bg-orange-700/30 dark:text-orange-300 dark:border-orange-600"><Ban className="mr-1 h-3 w-3"/>Suspended</Badge>;
      case 'banned': return <Badge variant="destructive"><UserX className="mr-1 h-3 w-3"/>Banned</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <Users className="mr-3 h-7 w-7" /> Manage Users
          </CardTitle>
          <CardDescription>View, filter, and manage all users on the EzCare Simplified platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by name, email, username..."
                className="pl-10 h-10 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search users"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRoleAdminView | 'all')}>
              <SelectTrigger className="h-10 text-sm" aria-label="Filter by role">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="lab_worker">Lab Worker</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as UserStatusAdminView | 'all')}>
              <SelectTrigger className="h-10 text-sm" aria-label="Filter by status">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md rounded-lg">
        <CardHeader>
            <CardTitle className="text-lg">User List</CardTitle>
            <CardDescription>{filteredUsers.length} user(s) found matching criteria.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>
                    <Button variant="link" asChild className="p-0 h-auto">
                        <Link href={`/${user.username}`} target="_blank" rel="noopener noreferrer">
                            @{user.username}
                        </Link>
                    </Button>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role.replace('_', ' ')}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" title="View User Profile" asChild>
                      <Link href={`/${user.username}`} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4" /> <span className="sr-only">View User Profile</span>
                      </Link>
                    </Button>
                    
                    {user.role !== 'admin' && user.status === 'pending_approval' && (user.role === 'doctor' || user.role === 'lab_worker') && (
                       <Button variant="ghost" size="icon" title="Approve User" className="hover:text-green-600" onClick={() => handleStatusChange(user.id, 'active', 'Approved')}>
                         <CheckCircle className="h-4 w-4" /> <span className="sr-only">Approve User</span>
                      </Button>
                    )}

                    {user.role !== 'admin' && user.status !== 'banned' && user.status !== 'pending_approval' && (
                      <Button variant="ghost" size="icon" title="Ban User" className="hover:text-destructive" onClick={() => handleStatusChange(user.id, 'banned', 'Banned')}>
                        <UserX className="h-4 w-4" /> <span className="sr-only">Ban User</span>
                      </Button>
                    )}
                     {user.role !== 'admin' && user.status === 'banned' && (
                      <Button variant="ghost" size="icon" title="Unban User" className="hover:text-green-600" onClick={() => handleStatusChange(user.id, 'active', 'Unbanned')}>
                         <ShieldCheck className="h-4 w-4" /> <span className="sr-only">Unban User</span>
                      </Button>
                    )}
                    {/* Add Suspend/Reinstate logic later if needed with a 'suspended' status */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {filteredUsers.length === 0 && <p className="text-muted-foreground text-center py-8">No users match your current filters.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
    

    