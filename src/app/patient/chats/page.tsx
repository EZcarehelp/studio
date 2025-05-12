"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MessageSquarePlus, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatListItem {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatarUrl: string;
  lastMessage: string;
  lastMessageTimestamp: number;
  unreadCount: number;
  isDoctorVerified: boolean;
}

const mockChatList: ChatListItem[] = [
  { id: 'chat1', doctorId: 'doc1', doctorName: 'Dr. Alice Smith', doctorSpecialty: 'Cardiologist', doctorAvatarUrl: 'https://picsum.photos/seed/doc1/100/100', lastMessage: "Okay, see you then!", lastMessageTimestamp: Date.now() - 1000 * 60 * 5, unreadCount: 0, isDoctorVerified: true },
  { id: 'chat2', doctorId: 'doc2', doctorName: 'Dr. Bob Johnson', doctorSpecialty: 'Dermatologist', doctorAvatarUrl: 'https://picsum.photos/seed/doc2/100/100', lastMessage: "Please upload the report. It's important for our next session.", lastMessageTimestamp: Date.now() - 1000 * 60 * 60 * 2, unreadCount: 2, isDoctorVerified: true },
  { id: 'chat3', doctorId: 'doc3', doctorName: 'Dr. Carol Williams', doctorSpecialty: 'Pediatrician', doctorAvatarUrl: 'https://picsum.photos/seed/doc3/100/100', lastMessage: "The prescription is attached. Please follow the instructions carefully.", lastMessageTimestamp: Date.now() - 1000 * 60 * 60 * 24, unreadCount: 0, isDoctorVerified: true },
];

export default function ChatsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredChats = mockChatList.filter(chat =>
    chat.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-xl rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient">My Chats</CardTitle>
          <CardDescription>Your recent conversations with doctors.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative mb-6">
            <Input
              type="text"
              placeholder="Search chats..."
              className="pl-10 h-10 text-base rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>

          {filteredChats.length > 0 ? (
            <div className="space-y-3">
              {filteredChats.map(chat => (
                <Link key={chat.id} href={`/patient/chats/${chat.id}`} passHref>
                  <div className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer flex items-start space-x-3 shadow-sm hover:shadow-md">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={chat.doctorAvatarUrl} alt={chat.doctorName} data-ai-hint="doctor avatar" />
                      <AvatarFallback>{chat.doctorName.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow overflow-hidden">
                      <div className="flex justify-between items-center mb-0.5">
                        <h3 className="font-medium text-base flex items-center truncate">
                          {chat.doctorName}
                          {chat.isDoctorVerified && <CheckCircle2 className="ml-1.5 h-4 w-4 text-green-500 flex-shrink-0" />}
                        </h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(chat.lastMessageTimestamp, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{chat.doctorSpecialty}</p>
                      <p className="text-sm text-foreground/80 truncate mt-1">{chat.lastMessage}</p>
                    </div>
                    {chat.unreadCount > 0 && (
                       <div className="ml-auto self-center flex-shrink-0">
                        <Badge 
                          className="bg-primary text-primary-foreground h-5 w-5 min-w-[1.25rem] flex items-center justify-center rounded-full p-0 text-xs"
                          aria-label={`${chat.unreadCount} unread messages`}
                        >
                          {chat.unreadCount}
                        </Badge>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquarePlus className="h-12 w-12 mx-auto mb-2" />
              <p>No chats found. Start a new conversation!</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 border-t">
          <Button className="w-full btn-premium rounded-md" asChild>
            <Link href="/patient/find-doctors"> {/* Or a dedicated new message page */}
              <MessageSquarePlus className="mr-2 h-4 w-4" /> Start New Chat
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
