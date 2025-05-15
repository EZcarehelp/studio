
"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ezCareChatbotFlow, type EzCareChatbotInput, type EzCareChatbotOutput } from '@/ai/flows/ez-care-chatbot-flow';
import { Loader2, AlertTriangle, Bot, UserCircle, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { AyurvedicRemedy } from '@/types';

const chatQuerySchema = z.object({
  query: z.string().min(3, { message: "Please describe your symptoms or query in at least 3 characters." }).max(2000),
});

type ChatQueryFormData = z.infer<typeof chatQuerySchema>;

interface DisplayMessage {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  remedy?: AyurvedicRemedy; // For bot messages containing remedy
  timestamp: number;
  isError?: boolean;
}

export default function EzCareChatbotPage() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);

  const form = useForm<ChatQueryFormData>({
    resolver: zodResolver(chatQuerySchema),
    defaultValues: {
      query: '',
    },
  });

  useEffect(() => {
    if (scrollAreaViewportRef.current) {
      scrollAreaViewportRef.current.scrollTop = scrollAreaViewportRef.current.scrollHeight;
    }
  }, [messages]);
  
  useEffect(() => {
    setMessages([
      {
        id: 'initial-bot-message',
        sender: 'bot',
        content: "Hello! I'm EzCare Chatbot. Describe your symptoms for analysis, or ask me for a home remedy suggestion. This tool is for informational purposes and does not substitute professional medical advice.",
        timestamp: Date.now(),
      }
    ]);
  }, []);


  const onSubmit: SubmitHandler<ChatQueryFormData> = async (data) => {
    setIsLoading(true);

    const userMessage: DisplayMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: data.query,
      timestamp: Date.now(),
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    form.reset(); 

    try {
      const inputData: EzCareChatbotInput = { query: data.query };
      const result: EzCareChatbotOutput = await ezCareChatbotFlow(inputData);
      
      let botContent = "";
      let botRemedy: AyurvedicRemedy | undefined = undefined;
      let isError = false;

      if (result.type === 'analysis' && result.analysis) {
        botContent = result.analysis;
      } else if (result.type === 'remedy' && result.remedy) {
        botContent = `Here's a remedy suggestion for "${result.remedy.remedyName}":`; // Main message
        botRemedy = { // Map AiAyurvedicRemedyOutput to AyurvedicRemedy
            id: `remedy-${Date.now()}`,
            name: result.remedy.remedyName,
            type: result.remedy.type,
            tags: [result.remedy.type],
            description: result.remedy.description,
            ingredients: result.remedy.ingredients || [],
            preparation: result.remedy.preparation || "",
            usage: result.remedy.usage || result.remedy.notes,
            source: result.remedy.disclaimer,
            isFavorite: false, // Default value
        };
      } else if (result.type === 'clarification' && result.message) {
        botContent = result.message;
      } else if (result.type === 'error' && result.errorMessage) {
        botContent = `Sorry, I encountered an error: ${result.errorMessage}`;
        isError = true;
      } else {
        botContent = "I'm not sure how to respond to that. Can you try rephrasing?";
        isError = true;
      }
      
      const botMessage: DisplayMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        content: botContent,
        remedy: botRemedy,
        timestamp: Date.now(),
        isError: isError,
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);

    } catch (err) {
      console.error("Chatbot error:", err);
      const errorMessageText = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      const errorMessage: DisplayMessage = {
        id: `error-${Date.now()}`,
        sender: 'bot',
        content: `Sorry, I encountered an error: ${errorMessageText}`,
        timestamp: Date.now(),
        isError: true,
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] max-h-[calc(100vh-9rem)] md:h-[calc(100vh-5.5rem)] md:max-h-[calc(100vh-5.5rem)] max-w-3xl mx-auto w-full">
      <Card className="flex flex-col flex-grow shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-4 border-b bg-muted/30 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarFallback><Bot className="h-6 w-6 text-primary" /></AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg text-gradient">EzCare Chatbot 🤖</CardTitle>
              <CardDescription className="text-xs">Online | Responds instantly</CardDescription>
            </div>
          </div>
        </CardHeader>

        <ScrollArea className="flex-grow p-4" viewportRef={scrollAreaViewportRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-end space-x-2",
                  msg.sender === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {msg.sender === 'bot' && (
                  <Avatar className="h-8 w-8 self-start">
                     <AvatarFallback className="bg-primary/20"><Bot className="h-5 w-5 text-primary" /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[70%] p-3 rounded-xl shadow-sm",
                    msg.sender === 'user'
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none",
                    msg.isError ? "bg-destructive/20 text-destructive border border-destructive/30" : ""
                  )}
                >
                  {msg.remedy ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert 
                      prose-headings:font-semibold prose-p:my-1
                      prose-a:text-primary hover:prose-a:text-secondary
                      prose-strong:text-foreground 
                      prose-ul:list-disc prose-ol:list-decimal prose-li:my-0.5
                      prose-blockquote:border-l-primary prose-blockquote:pl-2 prose-blockquote:italic">
                      <p>{msg.content}</p> {/* Main intro message for remedy */}
                      <h4 className="font-semibold mt-2 mb-1">{msg.remedy.name} ({msg.remedy.type})</h4>
                      <p className="text-xs opacity-90">{msg.remedy.description}</p>
                      {msg.remedy.ingredients && msg.remedy.ingredients.length > 0 && (
                        <>
                          <p className="text-xs font-medium mt-1.5 mb-0.5">Ingredients:</p>
                          <ul className="text-xs list-disc list-inside pl-1 space-y-0.5 opacity-80">
                            {msg.remedy.ingredients.map((item, index) => <li key={index}>{item}</li>)}
                          </ul>
                        </>
                      )}
                      {msg.remedy.preparation && (
                         <>
                          <p className="text-xs font-medium mt-1.5 mb-0.5">Preparation:</p>
                          <p className="text-xs opacity-80 whitespace-pre-line">{msg.remedy.preparation}</p>
                         </>
                      )}
                      {msg.remedy.usage && (
                        <>
                          <p className="text-xs font-medium mt-1.5 mb-0.5">Usage/Notes:</p>
                          <p className="text-xs opacity-80 whitespace-pre-line">{msg.remedy.usage}</p>
                        </>
                      )}
                      {msg.remedy.source && ( // Disclaimer usually in source for remedies
                        <p className="text-xs opacity-70 mt-2 border-t pt-1.5 italic">{msg.remedy.source}</p>
                      )}
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none dark:prose-invert 
                      prose-headings:font-semibold prose-p:my-1
                      prose-a:text-primary hover:prose-a:text-secondary
                      prose-strong:text-foreground 
                      prose-ul:list-disc prose-ol:list-decimal prose-li:my-0.5
                      prose-blockquote:border-l-primary prose-blockquote:pl-2 prose-blockquote:italic">
                      <ReactMarkdown
                          components={{
                              a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" />
                          }}
                      >{msg.content}</ReactMarkdown>
                    </div>
                  )}
                  <p className={cn(
                      "text-xs mt-1.5 text-right",
                      msg.sender === 'user' ? "text-primary-foreground/70" : "text-muted-foreground/70"
                    )}
                  >
                    {format(msg.timestamp, "p")}
                  </p>
                </div>
                 {msg.sender === 'user' && (
                  <Avatar className="h-8 w-8 self-start">
                     <AvatarFallback className="bg-secondary/20"><UserCircle className="h-5 w-5 text-secondary" /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && (
              <div className="flex justify-start space-x-2 items-center">
                 <Avatar className="h-8 w-8 self-start">
                   <AvatarFallback className="bg-primary/20"><Bot className="h-5 w-5 text-primary" /></AvatarFallback>
                 </Avatar>
                <div className="bg-muted text-foreground rounded-xl rounded-bl-none p-3 shadow-sm">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-3 bg-background/90 backdrop-blur-sm sticky bottom-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Textarea
                        id="query"
                        placeholder="Describe symptoms or ask for a remedy..."
                        className="min-h-[40px] max-h-[120px] resize-none text-sm rounded-full px-4 py-2.5"
                        rows={1}
                        {...field}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (form.formState.isValid) {
                                form.handleSubmit(onSubmit)();
                            }
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage className="px-2 text-xs"/>
                  </FormItem>
                )}
              />
              <Button type="submit" className="btn-premium rounded-full" size="icon" disabled={isLoading || !form.formState.isValid}>
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                 <span className="sr-only">Send</span>
              </Button>
            </form>
          </Form>
        </div>
      </Card>
    </div>
  );
}
