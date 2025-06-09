
"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardHeader } from '@/components/ui/card'; // Only CardHeader needed here
import { ArrowLeft, Paperclip, ImagePlus, Send, CheckCircle2, FileText, ShoppingBag, Plus } from 'lucide-react';
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
  { id: 'msg2', senderId: 'patient1', receiverId: 'doc1', text: "Hi Dr. Smith, I've been having some chest pain lately and it's concerning me.", timestamp: Date.now() - 1000 * 60 * 8, type: 'text' },
  { id: 'msg3', senderId: 'doc1', receiverId: 'patient1', text: "I see. Can you describe it in more detail? When does it occur, how long does it last, and what kind of pain is it (sharp, dull, pressure)?", timestamp: Date.now() - 1000 * 60 * 6, type: 'text' },
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
      notes: 'Take after food. Monitor for any side effects. Follow up in 2 weeks if symptoms persist or worsen.'
    },
    timestamp: Date.now() - 1000 * 60 * 5 
  },
  { id: 'msg5', senderId: 'patient1', receiverId: 'doc1', text: "Thank you, doctor! I'll follow the prescription and your advice.", timestamp: Date.now() - 1000 * 60 * 3, type: 'text' },
];


export default function ChatDetailPage() {
  const params = useParams();
  const chatId = params.chatId as string; // In a real app, fetch chat details using chatId
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null); // Ref for the ScrollArea viewport

  // Auto-scroll to bottom
   useEffect(() => {
    const viewport = scrollAreaViewportRef.current;
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
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
  
  if (!chatId) return <div className="flex items-center justify-center h-full"><p>Loading chat...</p></div>;

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full bg-background rounded-lg shadow-xl overflow-hidden">
      {/* Chat Header */}
      <CardHeader className="border-b p-3 flex flex-row items-center space-x-3 sticky top-0 bg-background/90 backdrop-blur-sm z-10">
        <Button variant="ghost" size="icon" asChild className="mr-1 rounded-full">
          <Link href="/patient/chats">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to chats</span>
          </Link>
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage src={mockDoctor.avatarUrl} alt={mockDoctor.name} data-ai-hint="doctor avatar" />
          <AvatarFallback>{mockDoctor.name.substring(0,2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-base flex items-center">
            {mockDoctor.name}
            {mockDoctor.isVerified && <CheckCircle2 className="ml-1.5 h-4 w-4 text-green-500 flex-shrink-0" />}
          </h2>
          <p className="text-xs text-muted-foreground">{mockDoctor.specialty}</p>
        </div>
      </CardHeader>

      {/* Message Thread */}
      <ScrollArea className="flex-grow" viewportRef={scrollAreaViewportRef}>
        <div className="p-4 space-y-4">
          {messages.map(msg => {
            const isUserMessage = msg.senderId === mockPatient.id;
            return (
              <div key={msg.id} className={cn("flex mb-1", isUserMessage ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[75%] md:max-w-[65%] p-2.5 shadow-sm",
                    isUserMessage 
                      ? "bg-primary text-primary-foreground rounded-xl rounded-br-sm" 
                      : "bg-muted text-foreground rounded-xl rounded-bl-sm"
                  )}
                >
                  {msg.type === 'text' && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                  {msg.type === 'prescription' && msg.prescriptionDetails && (
                    <PrescriptionMessage prescription={msg.prescriptionDetails} />
                  )}
                  {/* Add image message display later */}
                  <p className={cn(
                      "text-xs mt-1.5", 
                      isUserMessage ? "text-primary-foreground/70 text-right" : "text-muted-foreground text-right"
                    )}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="border-t p-3 flex items-center space-x-2 sticky bottom-0 bg-background/90 backdrop-blur-sm z-10">
        <Button variant="ghost" size="icon" type="button" className="rounded-full">
          <Plus className="h-5 w-5" />
          <span className="sr-only">Attach file or options</span>
        </Button>
        <Button variant="ghost" size="icon" type="button" className="rounded-full">
          <ImagePlus className="h-5 w-5" />
          <span className="sr-only">Upload image</span>
        </Button>
        <Input
          type="text"
          placeholder="Type a message..."
          className="flex-grow h-10 text-sm rounded-full px-4"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button type="submit" size="icon" className="btn-premium rounded-full" disabled={!newMessage.trim()}>
          <Send className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
}


function PrescriptionMessage({ prescription }: { prescription: Prescription }) {
  return (
    <div className="border border-secondary rounded-md p-3 bg-secondary/10 my-1">
      <div className="flex items-center gap-2 mb-2 border-b border-secondary/30 pb-1.5">
        <FileText className="h-5 w-5 text-secondary" />
        <h4 className="font-semibold text-secondary text-sm">Prescription</h4>
      </div>
      <ul className="space-y-1 list-disc list-inside text-xs text-foreground/90">
        {prescription.medicines.map((med, i) => (
          <li key={i}>
            <strong>{med.name}</strong>: {med.dosage} ({med.duration})
          </li>
        ))}
      </ul>
      {prescription.notes && <p className="text-xs text-muted-foreground mt-2 pt-1 border-t border-secondary/20">Notes: {prescription.notes}</p>}
      <Button variant="link" size="sm" className="mt-2 p-0 h-auto text-secondary hover:text-secondary/80 text-xs" asChild>
        <Link href={`/patient/store?search=${encodeURIComponent(prescription.medicines.map(m => m.name).join(','))}`}>
          <ShoppingBag className="mr-1 h-3 w-3" /> Find Medicines
        </Link>
      </Button>
    </div>
  );
}
