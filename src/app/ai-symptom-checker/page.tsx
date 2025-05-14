
"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { aiSymptomAnalysis, type AiSymptomAnalysisInput, type AiSymptomAnalysisOutput } from '@/ai/flows/ai-symptom-analysis';
import { Loader2, AlertTriangle, Bot, UserCircle, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const symptomSchema = z.object({
  symptoms: z.string().min(10, { message: "Please describe your symptoms in at least 10 characters." }).max(2000),
});

type SymptomFormData = z.infer<typeof symptomSchema>;

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: number;
  analysis?: AiSymptomAnalysisOutput; // For bot messages containing analysis
}

export default function EzCareChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);

  const form = useForm<SymptomFormData>({
    resolver: zodResolver(symptomSchema),
    defaultValues: {
      symptoms: '',
    },
  });

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaViewportRef.current) {
      scrollAreaViewportRef.current.scrollTop = scrollAreaViewportRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Initial bot message
  useEffect(() => {
    setMessages([
      {
        id: 'initial-bot-message',
        sender: 'bot',
        content: "Hello! I'm EzCare Chatbot. Describe your symptoms, and I'll provide a preliminary analysis. This tool is for informational purposes and does not substitute professional medical advice.",
        timestamp: Date.now(),
      }
    ]);
  }, []);


  const onSubmit: SubmitHandler<SymptomFormData> = async (data) => {
    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: data.symptoms,
      timestamp: Date.now(),
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    form.reset(); // Clear the input field

    try {
      const inputData: AiSymptomAnalysisInput = { symptoms: data.symptoms };
      const result = await aiSymptomAnalysis(inputData);
      
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        content: result.analysis, // The main analysis string
        analysis: result, // Store full analysis if needed for other parts
        timestamp: Date.now(),
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);

    } catch (err) {
      console.error("Symptom analysis error:", err);
      const errorMessageText = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(errorMessageText); // Set error state to display it
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'bot',
        content: `Sorry, I encountered an error: ${errorMessageText}`,
        timestamp: Date.now(),
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,8rem)-2rem)] max-h-[calc(100vh-var(--header-height,8rem)-2rem)] md:max-h-[calc(100vh-var(--header-height,10rem)-2rem)] max-w-3xl mx-auto w-full">
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
                    msg.id.startsWith('error-') ? "bg-destructive/20 text-destructive border border-destructive/30" : ""
                  )}
                >
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

        {error && !messages.some(m => m.id.startsWith('error-')) && ( // Show general error if not already shown as a message
          <div className="p-3 border-t bg-destructive/10 text-destructive text-sm flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        <div className="border-t p-3 bg-background/90 backdrop-blur-sm sticky bottom-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Textarea
                        id="symptoms"
                        placeholder="Describe your symptoms here..."
                        className="min-h-[40px] max-h-[120px] resize-none text-sm rounded-full px-4 py-2.5"
                        rows={1}
                        {...field}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            form.handleSubmit(onSubmit)();
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

    