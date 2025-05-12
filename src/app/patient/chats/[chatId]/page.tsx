"use client";

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Paperclip, ImagePlus, Send, CheckCircle2, FileText, ShoppingBag } from 'lucide-react';
import type { ChatMessage, Prescription } from '@/types';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock data - in a real app, this would be fetched
const mockDoctor = { 
  id: 'doc1', 
  name: 'Dr. Alice Smith', 
  specialty: 'Cardiologist', 
  avatarUrl: 'https://picsum.photos/seed/doc1/100/100',
  isVerified: true 
};
const mockPatient = { 
  id: 'patient1', 
  name: 'Current User', 
  avatarUrl: 'https://picsum.photos/seed/patient1/100/100'
};

const mockMessages: ChatMessage[] = [
  { id: 'msg1', senderId: 'doc1', receiverId: 'patient1', text: "Hello! How can I help you today?", timestamp: Date.now() - 1000 * 60 * 10, type: 'text' },
  { id: 'msg2', senderId: 'patient1', receiverId: 'doc1', text: "Hi Dr. Smith, I've been having some chest pain.", timestamp: Date.now() - 1000 * 60 * 8, type: 'text' },
  { id: 'msg3', senderId: 'doc1', receiverId: 'patient1', text: "I see. Can you describe it in more detail?", timestamp: Date.now() - 1000 * 60 * 6, type: 'text' },
  { 
    id: 'msg4', 
    senderId: 'doc1', 
    receiverId: 'patient1', 
    type: 'prescription', 
    prescriptionDetails: {
      id: 'presc1',
      doctorId: 'doc1',
      patientId: 'patient1',
      dateIssued: Date.now() - 1000 * 60 * 5,
      medicines: [
        { name: 'Aspirin 75mg', dosage: '1 tablet daily', duration: '30 days' },
        { name: 'Atorvastatin 10mg', dosage: '1 tablet at night', duration: '90 days' },
      ],
      notes: 'Take after food. Follow up in 2 weeks.'
    },
    timestamp: Date.now() - 1000 * 60 * 5 
  },
  { id: 'msg5', senderId: 'patient1', receiverId: 'doc1', text: "Thank you, doctor!", timestamp: Date.now() - 1000 * 60 * 3, type: 'text' },
];


export default function ChatDetailPage() {
  const params = useParams();
  const chatId = params.chatId as string;
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);


  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msg: ChatMessage = {
      id: `msg${Date.now()}`,
      senderId: mockPatient.id,
      receiverId: mockDoctor.id,
      text: newMessage,
      timestamp: Date.now(),
      type: 'text'
    };
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
  };
  
  // In a real app, fetch chat details using chatId
  if (!chatId) return <div>Loading chat...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,10rem))] max-h-[calc(100vh-var(--header-height,8rem))] md:max-h-[calc(100vh-var(--header-height,10rem))]"> {/* Adjust header height as needed */}
      {/* Chat Header */}
      <CardHeader className="border-b p-4 flex flex-row items-center space-x-3 sticky top-0 bg-background z-10">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/patient/chats">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <Avatar>
          <AvatarImage src={mockDoctor.avatarUrl} alt={mockDoctor.name} />
          <AvatarFallback>{mockDoctor.name.substring(0,2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-lg flex items-center">
            {mockDoctor.name}
            {mockDoctor.isVerified && <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />}
          </h2>
          <p className="text-sm text-muted-foreground">{mockDoctor.specialty}</p>
        </div>
      </CardHeader>

      {/* Message Thread */}
      <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
        {messages.map(msg => {
          const isUserMessage = msg.senderId === mockPatient.id;
          return (
            <div key={msg.id} className={cn("flex mb-3", isUserMessage ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[70%] p-3 rounded-xl shadow",
                  isUserMessage ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted text-foreground rounded-bl-none"
                )}
              >
                {msg.type === 'text' && <p className="text-sm">{msg.text}</p>}
                {msg.type === 'prescription' && msg.prescriptionDetails && (
                  <PrescriptionMessage prescription={msg.prescriptionDetails} />
                )}
                {/* Add image message display later */}
                <p className={cn("text-xs mt-1", isUserMessage ? "text-primary-foreground/70 text-right" : "text-muted-foreground/70 text-left")}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </ScrollArea>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="border-t p-4 flex items-center space-x-2 sticky bottom-0 bg-background z-10">
        <Button variant="ghost" size="icon" type="button">
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Attach file</span>
        </Button>
        <Button variant="ghost" size="icon" type="button">
          <ImagePlus className="h-5 w-5" />
          <span className="sr-only">Upload image</span>
        </Button>
        <Input
          type="text"
          placeholder="Type a message..."
          className="flex-grow h-10 text-base"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button type="submit" size="icon" className="btn-premium" disabled={!newMessage.trim()}>
          <Send className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
}


function PrescriptionMessage({ prescription }: { prescription: Prescription }) {
  return (
    <div className="border border-primary/50 rounded-md p-3 bg-blue-50 dark:bg-blue-900/30">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-5 w-5 text-primary" />
        <h4 className="font-semibold text-primary">Prescription</h4>
      </div>
      <ul className="space-y-1 list-disc list-inside text-sm">
        {prescription.medicines.map((med, i) => (
          <li key={i}>
            <strong>{med.name}</strong>: {med.dosage} ({med.duration})
          </li>
        ))}
      </ul>
      {prescription.notes && <p className="text-xs text-muted-foreground mt-2">Notes: {prescription.notes}</p>}
      <Button variant="link" size="sm" className="mt-2 p-0 h-auto text-primary hover:text-secondary" asChild>
        <Link href={`/patient/store?search=${prescription.medicines.map(m => m.name).join(' ')}`}> {/* Basic search query */}
          <ShoppingBag className="mr-1 h-3 w-3" /> Find Medicines
        </Link>
      </Button>
    </div>
  );
}
