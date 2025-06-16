
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSpreadsheet, Search, Filter, Download, AlertCircle, Info, CheckCircle } from "lucide-react";
import { Badge } from '@/components/ui/badge';

type LogLevel = 'info' | 'warning' | 'error' | 'success';
type LogCategory = 'auth' | 'approval' | 'user_management' | 'system' | 'api_call';

interface SystemLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  actor?: string; // User or System component that initiated action
  details?: Record<string, any>; // Additional structured data
}

const mockLogs: SystemLog[] = [
  { id: 'log1', timestamp: '2024-07-14 10:00:00', level: 'info', category: 'auth', message: 'Admin login successful.', actor: 'ezcarehelp@gmail.com' },
  { id: 'log2', timestamp: '2024-07-14 10:05:12', level: 'success', category: 'approval', message: 'Dr. New Applicant approved.', actor: 'AdminUser1', details: { doctorId: 'u4' } },
  { id: 'log3', timestamp: '2024-07-14 10:15:30', level: 'warning', category: 'user_management', message: 'Suspended User account temporarily suspended due to policy violation.', actor: 'AdminUser1', details: { userId: 'u5', reason: 'Spam activity' } },
  { id: 'log4', timestamp: '2024-07-14 11:00:00', level: 'error', category: 'api_call', message: 'Failed to fetch external service data. Status: 503', actor: 'System', details: { service: 'PaymentGateway', endpoint: '/charge' } },
  { id: 'log5', timestamp: '2024-07-14 11:05:00', level: 'info', category: 'system', message: 'Database backup completed successfully.', actor: 'System' },
];

export default function AdminSystemLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>(mockLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<LogCategory | 'all'>('all');

  const filteredLogs = logs.filter(log => {
    const termMatch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (log.actor && log.actor.toLowerCase().includes(searchTerm.toLowerCase()));
    const levelMatch = levelFilter === 'all' || log.level === levelFilter;
    const categoryMatch = categoryFilter === 'all' || log.category === categoryFilter;
    return termMatch && levelMatch && categoryMatch;
  });
  
  const getLevelIcon = (level: LogLevel) => {
    switch(level) {
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <FileSpreadsheet className="mr-3 h-7 w-7" />
            System & Audit Logs
          </CardTitle>
          <CardDescription>Monitor platform activity, errors, and administrative actions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div className="relative sm:col-span-2 md:col-span-1">
              <Input
                type="text"
                placeholder="Search logs..."
                className="pl-10 h-10 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Select value={levelFilter} onValueChange={(value) => setLevelFilter(value as LogLevel | 'all')}>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="Filter by Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>
             <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as LogCategory | 'all')}>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="auth">Authentication</SelectItem>
                <SelectItem value="approval">Approvals</SelectItem>
                <SelectItem value="user_management">User Management</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="api_call">API Calls</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-10 text-sm">
              <Download className="mr-2 h-4 w-4" /> Export Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md rounded-lg">
         <CardHeader>
            <CardTitle className="text-lg">Log Entries</CardTitle>
            <CardDescription>{filteredLogs.length} log(s) found.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="w-[40%]">Message</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground">{log.timestamp}</TableCell>
                  <TableCell className="capitalize flex items-center gap-1">
                    {getLevelIcon(log.level)}
                    {log.level}
                  </TableCell>
                  <TableCell className="capitalize text-xs">
                    <Badge variant="secondary">{log.category.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{log.message}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{log.actor || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    {log.details && (
                        <Button variant="ghost" size="sm" onClick={() => alert(JSON.stringify(log.details, null, 2))}>View</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {filteredLogs.length === 0 && <p className="text-muted-foreground text-center py-8">No logs match your current filters.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

    