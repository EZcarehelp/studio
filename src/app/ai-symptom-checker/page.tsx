
"use client";

import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { ezCareChatbotFlow, type EzCareChatbotInput, type EzCareChatbotOutput, type PrescriptionInsight, type ReportContext } from '@/ai/flows/ez-care-chatbot-flow';
import { Loader2, Bot, UserCircle, Send, Paperclip, XCircle, MessageSquarePlus, Settings, Mic, User, Leaf, CalendarDays, Rss, Info, Menu, CloudSun } from 'lucide-react';
import NextImage from 'next/image';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { AyurvedicRemedy } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from '@/components/ui/input'; // For potential future sidebar search

const chatQuerySchema = z.object({
  query: z.string().min(1, { message: "Please type a message or upload a prescription." }).max(2000),
});

type ChatQueryFormData = z.infer<typeof chatQuerySchema>;

interface DisplayMessage {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  remedy?: AyurvedicRemedy;
  prescriptionInsight?: PrescriptionInsight;
  uploadedImagePreviewUrl?: string;
  timestamp: number;
  isError?: boolean;
}

const mockUser = {
  name: "Demo User",
  avatarUrl: "https://placehold.co/100x100.png?text=DU",
  dataAiHint: "user avatar"
};

export default function EzCareChatbotPage() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPrescriptionFile, setSelectedPrescriptionFile] = useState<File | null>(null);
  const [prescriptionImageDataUri, setPrescriptionImageDataUri] = useState<string | null>(null);
  const [imagePreviewForUpload, setImagePreviewForUpload] = useState<string | null>(null);
  
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams(); 

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptFromSpeechRef = useRef<string>('');

  const [activeReportContext, setActiveReportContext] = useState<ReportContext | null>(null);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);


  const form = useForm<ChatQueryFormData>({
    resolver: zodResolver(chatQuerySchema),
    defaultValues: { query: '' },
  });

  useEffect(() => {
    const reportDataUri = searchParams.get('reportContextDataUri');
    const reportSummary = searchParams.get('reportContextSummary');
    const reportName = searchParams.get('reportName');

    if (reportDataUri || reportSummary || reportName) {
      const context: ReportContext = {
        imageDataUri: reportDataUri ? decodeURIComponent(reportDataUri) : undefined,
        textSummary: reportSummary ? decodeURIComponent(reportSummary) : undefined,
        reportName: reportName ? decodeURIComponent(reportName) : undefined,
      };
      setActiveReportContext(context);
      toast({
        title: "Lab Report Context Loaded",
        description: `Now discussing: ${context.reportName || 'Selected Report'}. Ask your questions!`,
        duration: 5000,
      });
       if (!form.getValues('query')) {
        form.setValue('query', `Regarding my ${context.reportName || 'recent lab report'}, `);
      }
    }
  }, [searchParams, toast, form]);


  useEffect(() => {
    if (scrollAreaViewportRef.current) {
      scrollAreaViewportRef.current.scrollTop = scrollAreaViewportRef.current.scrollHeight;
    }
  }, [messages]);
  
  const initializeChat = (keepContext = false) => {
    const initialMessageContent = activeReportContext && keepContext
      ? `Hello! I'm EzCare AI. I see you're looking at "${activeReportContext.reportName}". How can I help you with it? You can also describe other symptoms or ask for a remedy.`
      : "Hello! I'm EzCare AI. Describe your symptoms, ask for a home remedy, or upload a prescription image for analysis. This tool is for informational purposes and does not substitute professional medical advice.";

    setMessages([
      {
        id: 'initial-bot-message',
        sender: 'bot',
        content: initialMessageContent,
        timestamp: Date.now(),
      }
    ]);
    form.reset({ query: activeReportContext && keepContext ? `Regarding my ${activeReportContext.reportName || 'recent lab report'}, ` : '' });
    clearSelectedImage();
    if (!keepContext) {
      setActiveReportContext(null); 
    }
  };

  useEffect(() => {
    initializeChat(!!activeReportContext); 
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeReportContext]); 


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = true; 
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
          let currentFinalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) currentFinalTranscript += event.results[i][0].transcript;
          }
          if (currentFinalTranscript) {
            finalTranscriptFromSpeechRef.current = currentFinalTranscript.trim();
            const existingQuery = form.getValues('query');
            form.setValue('query', (existingQuery ? existingQuery + ' ' : '') + finalTranscriptFromSpeechRef.current, { shouldValidate: true });
          }
        };
        recognition.onerror = (event) => {
          let msg = "Voice input error.";
          if (event.error === 'no-speech') msg = "No speech detected.";
          else if (event.error === 'audio-capture') msg = "Microphone problem.";
          else if (event.error === 'not-allowed') msg = "Microphone access denied.";
          else if (event.error === 'network') msg = "Network error during speech recognition.";
          toast({ variant: "destructive", title: "Voice Input Error", description: msg });
          setIsListening(false);
        };
        recognition.onend = () => {
            setIsListening(false);
            finalTranscriptFromSpeechRef.current = '';
        };
        recognitionRef.current = recognition;
      } else {
        toast({ variant: "destructive", title: "Voice Input Not Supported" });
      }
    }
    return () => recognitionRef.current?.stop();
  }, [form, toast]);


  const handleMicClick = () => {
    if (!recognitionRef.current) return toast({ variant: "destructive", title: "Voice Input Not Supported" });
    if (isListening) recognitionRef.current.stop();
    else {
      try {
        recognitionRef.current.start();
      } catch (error) {
        toast({ variant: "destructive", title: "Voice Input Error", description: "Could not start voice input. Check permissions." });
      }
    }
  };


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        toast({ variant: "destructive", title: "File too large", description: "Please upload an image smaller than 5MB." });
        return;
      }
      setSelectedPrescriptionFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setPrescriptionImageDataUri(dataUri);
        setImagePreviewForUpload(dataUri);
        if (!form.getValues('query')) form.setValue('query', 'Analyze this prescription.');
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelectedImage = () => {
    setSelectedPrescriptionFile(null);
    setPrescriptionImageDataUri(null);
    setImagePreviewForUpload(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit: SubmitHandler<ChatQueryFormData> = async (data) => {
    if (!data.query.trim() && !prescriptionImageDataUri) {
      toast({ variant: "destructive", title: "Input required" });
      return;
    }
    setIsLoading(true);

    const userMessage: DisplayMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: data.query,
      uploadedImagePreviewUrl: prescriptionImageDataUri || undefined,
      timestamp: Date.now(),
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    const inputData: EzCareChatbotInput = { 
        query: data.query,
        ...(prescriptionImageDataUri && { prescriptionImage: prescriptionImageDataUri }),
        ...(activeReportContext && { currentReportContext: activeReportContext }),
    };

    form.reset({ query: '' }); 
    clearSelectedImage();

    try {
      const result: EzCareChatbotOutput = await ezCareChatbotFlow(inputData);
      
      let botContent = "";
      let botRemedy: AyurvedicRemedy | undefined = undefined;
      let botPrescriptionInsight: PrescriptionInsight | undefined = undefined;
      let isError = false;

      switch (result.type) {
        case 'analysis':
          botContent = result.analysis || "Could not retrieve analysis.";
          break;
        case 'remedy':
          botContent = `Here's a remedy suggestion for "${result.remedy?.remedyName || 'your query'}":`;
          if (result.remedy) {
            botRemedy = {
                id: `remedy-${Date.now()}`,
                name: result.remedy.remedyName,
                type: result.remedy.type,
                tags: [result.remedy.type],
                description: result.remedy.description,
                ingredients: result.remedy.ingredients || [],
                preparation: result.remedy.preparation || "",
                usage: result.remedy.usage || result.remedy.notes,
                source: result.remedy.disclaimer,
                isFavorite: false,
            };
          }
          break;
        case 'prescription_insight':
          botContent = result.prescriptionInsight?.summary || "Here's an analysis of the prescription:";
          botPrescriptionInsight = result.prescriptionInsight;
          break;
        case 'report_insight': 
          botContent = result.reportInsightMessage || "I've analyzed the report context.";
          break;
        case 'clarification':
          botContent = result.message || "Could you please clarify?";
          break;
        case 'error':
          botContent = `Sorry, I encountered an error: ${result.errorMessage || 'Unknown error'}`;
          isError = true;
          break;
        default:
          botContent = "I'm not sure how to respond to that. Can you try rephrasing?";
          isError = true;
      }
      
      const botMessage: DisplayMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        content: botContent,
        remedy: botRemedy,
        prescriptionInsight: botPrescriptionInsight,
        timestamp: Date.now(),
        isError: isError,
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);

    } catch (err) {
      console.error("Chatbot error:", err);
      const errorMessageText = err instanceof Error ? err.message : "An unexpected error occurred.";
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

  const canSubmit = form.formState.isValid || !!prescriptionImageDataUri;

  const sidebarItems = [
    { label: "Ayurvedic Remedies", icon: Leaf, href: "/patient/ayurvedic-remedies" },
    { label: "Health News", icon: Rss, href: "/health-news" },
    { label: "Climate Health", icon: CloudSun, href: "/patient/climate-health" },
  ];

  return (
    <div className="flex h-[calc(100vh-4.5rem)] w-full bg-slate-100 dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-[260px] flex-col bg-white dark:bg-[#111827] p-4 space-y-2 border-r border-slate-200 dark:border-slate-700">
        <div className='mb-4'>
            <h2 className="text-xl font-semibold text-foreground dark:text-white mb-1">EzCare AI</h2>
             <Button variant="default" onClick={() => initializeChat(false)} className="w-full btn-premium rounded-lg text-sm">
                <MessageSquarePlus className="mr-2 h-4 w-4" /> New Chat
            </Button>
        </div>

        {/* Can add a search bar here if needed: <Input placeholder="Search chats..." className="mb-3 rounded-md" /> */}
        
        <nav className="space-y-1 flex-grow">
            {sidebarItems.map((item, index) => (
            <Link key={index} href={item.href}>
                <Button variant="ghost" className="w-full justify-start text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md">
                <item.icon className="mr-3 h-5 w-5" /> {item.label}
                </Button>
            </Link>
            ))}
        </nav>
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
             <Button variant="ghost" className="w-full justify-start text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md">
                <Settings className="mr-3 h-5 w-5" /> Settings
            </Button>
             <Link href="/patient/settings">
                <div className="flex items-center space-x-2 mt-3 p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={mockUser.avatarUrl} alt={mockUser.name} data-ai-hint={mockUser.dataAiHint}/>
                        <AvatarFallback><User className="h-4 w-4"/></AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{mockUser.name}</span>
                </div>
            </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#1E1E2F]">
        {/* Chat Header */}
        <header className="h-[60px] px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="md:hidden">
              <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[260px] p-0 pt-4 bg-white dark:bg-[#111827]">
                  <SheetHeader className="px-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <SheetTitle className="text-left text-xl font-semibold text-foreground dark:text-white">EzCare Menu</SheetTitle>
                    <SheetClose />
                  </SheetHeader>
                  <div className="p-3 space-y-1">
                     <Button variant="default" onClick={() => {initializeChat(false); setIsMobileSheetOpen(false);}} className="w-full btn-premium rounded-lg text-sm mb-2">
                        <MessageSquarePlus className="mr-2 h-4 w-4" /> New Chat
                    </Button>
                    {sidebarItems.map((item, index) => (
                        <SheetClose asChild key={`${item.label}-mobile-${index}`}>
                          <Link href={item.href}>
                            <Button variant="ghost" className="w-full justify-start text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md">
                              <item.icon className="mr-3 h-5 w-5" /> {item.label}
                            </Button>
                          </Link>
                        </SheetClose>
                    ))}
                     <div className="pt-2 border-t border-slate-200 dark:border-slate-700 mt-3">
                         <SheetClose asChild>
                            <Button variant="ghost" className="w-full justify-start text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md">
                                <Settings className="mr-3 h-5 w-5" /> Settings
                            </Button>
                        </SheetClose>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <h1 className="text-lg font-semibold text-foreground dark:text-white">EzCare AI Chatbot</h1>
          </div>
           {activeReportContext?.reportName && (
            <div className="hidden sm:flex text-xs text-muted-foreground border border-dashed border-primary/50 dark:border-accent/50 px-2 py-1 rounded-md items-center gap-1.5">
              <Info size={14} className="text-primary dark:text-accent"/>
              Context: {activeReportContext.reportName.length > 20 ? activeReportContext.reportName.substring(0,17) + "..." : activeReportContext.reportName}
              <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full" onClick={() => { setActiveReportContext(null); initializeChat(false); toast({title: "Report context cleared."})}}>
                <XCircle size={14} />
                <span className="sr-only">Clear report context</span>
              </Button>
            </div>
          )}
          <Avatar className="h-8 w-8">
            <AvatarImage src={mockUser.avatarUrl} alt={mockUser.name} data-ai-hint={mockUser.dataAiHint}/>
            <AvatarFallback><User className="h-4 w-4"/></AvatarFallback>
          </Avatar>
        </header>

        <ScrollArea className="flex-grow p-4 md:p-6" viewportRef={scrollAreaViewportRef}>
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
                  <Avatar className="h-8 w-8 self-start shrink-0"> 
                     <AvatarFallback className="bg-primary/10 dark:bg-slate-700"><Bot className="h-5 w-5 text-primary dark:text-slate-300" /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[70%] p-3 rounded-2xl shadow-sm text-sm", 
                    msg.sender === 'user'
                      ? "bg-primary text-primary-foreground dark:bg-blue-600 dark:text-white rounded-br-sm" // User messages
                      : "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 rounded-bl-sm", // Bot messages
                    msg.isError ? "bg-destructive/20 text-destructive dark:bg-red-700/50 dark:text-red-200 border border-destructive/30 dark:border-red-600" : ""
                  )}
                >
                  {msg.uploadedImagePreviewUrl && msg.sender === 'user' && (
                    <div className="mb-2 border border-primary-foreground/20 dark:border-slate-600 rounded-md overflow-hidden">
                        <NextImage src={msg.uploadedImagePreviewUrl} alt="Uploaded prescription preview" width={200} height={150} style={{ objectFit: 'contain' }} className="max-h-[150px] w-auto"/>
                    </div>
                  )}
                  {msg.remedy ? ( // Remedy styling remains similar
                    <div className="prose prose-sm max-w-none dark:prose-invert 
                      prose-headings:font-semibold prose-p:my-1
                      prose-a:text-primary dark:prose-a:text-blue-400 hover:prose-a:text-secondary
                      prose-strong:text-inherit
                      prose-ul:list-disc prose-ol:list-decimal prose-li:my-0.5
                      prose-blockquote:border-l-primary prose-blockquote:pl-2 prose-blockquote:italic
                      dark:text-slate-300">
                      <p className="dark:text-white">{msg.content}</p>
                      <h4 className="font-semibold mt-2 mb-1 dark:text-white">{msg.remedy.name} ({msg.remedy.type})</h4>
                      <p className="text-xs opacity-90 dark:text-slate-400">{msg.remedy.description}</p>
                      {/* ... other remedy details ... */}
                       {msg.remedy.source && (
                        <p className="text-xs opacity-70 mt-2 border-t pt-1.5 italic dark:text-slate-500 dark:border-slate-600">{msg.remedy.source}</p>
                      )}
                    </div>
                  ) : msg.prescriptionInsight ? ( // Prescription insight styling
                    <div className="prose prose-sm max-w-none dark:prose-invert 
                        prose-headings:font-semibold prose-h4:my-1.5 prose-p:my-0.5
                        prose-ul:list-disc prose-ol:list-decimal prose-li:my-0.5
                        prose-strong:font-medium prose-strong:text-inherit
                         dark:text-slate-300">
                       {msg.prescriptionInsight.summary && <p className="font-semibold dark:text-white">{msg.prescriptionInsight.summary}</p>}
                       {msg.content !== msg.prescriptionInsight.summary && <p className="dark:text-white">{msg.content}</p>}
                       
                       {msg.prescriptionInsight.analyzedMedicines.map((med, index) => (
                         <div key={index} className="mt-2 py-1.5 border-t border-inherit/20 dark:border-slate-600 first:border-t-0 first:mt-0">
                           <h4 className="font-semibold text-inherit dark:text-white">{med.name}</h4>
                           <p><strong>Purpose:</strong> {med.purpose}</p>
                           <p><strong>Benefits:</strong> {med.benefits}</p>
                           <p><strong>Proper Usage:</strong> {med.properUsage}</p>
                         </div>
                       ))}
                       {msg.prescriptionInsight.generalAdvice && <p className="mt-2"><strong>General Advice:</strong> {msg.prescriptionInsight.generalAdvice}</p>}
                       <p className="text-xs opacity-70 mt-2 pt-1.5 border-t border-inherit/30 dark:border-slate-600 italic dark:text-slate-500">{msg.prescriptionInsight.disclaimer}</p>
                    </div>
                  ) : ( // Regular text message styling
                    <div className="prose prose-sm max-w-none dark:prose-invert 
                      prose-headings:font-semibold prose-p:my-1
                      prose-a:text-primary dark:prose-a:text-blue-400 hover:prose-a:text-secondary
                      prose-strong:text-inherit
                      prose-ul:list-disc prose-ol:list-decimal prose-li:my-0.5
                      prose-blockquote:border-l-primary prose-blockquote:pl-2 prose-blockquote:italic
                      dark:text-slate-300">
                      <ReactMarkdown
                          components={{
                              a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary dark:text-blue-400 hover:underline" />
                          }}
                      >{msg.content}</ReactMarkdown>
                    </div>
                  )}
                  <p className={cn(
                      "text-xs mt-1.5 text-right",
                      msg.sender === 'user' ? "text-primary-foreground/70 dark:text-slate-300" : "text-slate-500 dark:text-slate-400"
                    )}
                  >
                    {format(msg.timestamp, "p")}
                  </p>
                </div>
                 {msg.sender === 'user' && (
                  <Avatar className="h-8 w-8 self-start shrink-0"> 
                     <AvatarImage src={mockUser.avatarUrl} alt={mockUser.name} data-ai-hint={mockUser.dataAiHint}/>
                     <AvatarFallback className="bg-primary/20 dark:bg-slate-700"><UserCircle className="h-5 w-5 text-primary dark:text-slate-300" /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && (
              <div className="flex justify-start space-x-2 items-center">
                 <Avatar className="h-8 w-8 self-start">
                   <AvatarFallback className="bg-primary/10 dark:bg-slate-700"><Bot className="h-5 w-5 text-primary dark:text-slate-300" /></AvatarFallback>
                 </Avatar>
                <div className="bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 rounded-2xl rounded-bl-sm p-3 shadow-sm">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-500 dark:text-slate-400" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="min-h-[60px] max-h-[120px] px-3 py-2 border-t border-slate-200 dark:border-slate-700">
          {imagePreviewForUpload && (
            <div className="mb-2 p-2 border border-slate-300 dark:border-slate-600 rounded-md relative max-w-[150px] bg-slate-100 dark:bg-slate-800">
              <NextImage src={imagePreviewForUpload} alt="Preview" width={100} height={75} style={{objectFit: 'contain'}} className="rounded max-h-[75px] w-auto" />
              <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive/80 text-destructive-foreground hover:bg-destructive" onClick={clearSelectedImage}>
                <XCircle className="h-4 w-4" />
                <span className="sr-only">Clear image</span>
              </Button>
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center space-x-2">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" id="prescriptionUpload" />
              <Button variant="ghost" size="icon" type="button" onClick={() => fileInputRef.current?.click()} className="rounded-full text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400">
                <Paperclip className="h-5 w-5" />
                <span className="sr-only">Attach prescription</span>
              </Button>
               <Button 
                variant="ghost" 
                size="icon" 
                type="button" 
                onClick={handleMicClick} 
                className={cn(
                  "rounded-full hover:text-primary dark:hover:text-blue-400",
                  isListening ? "text-destructive dark:text-red-400 animate-pulse" : "text-slate-500 dark:text-slate-400"
                )}
                disabled={!recognitionRef.current}
              >
                <Mic className="h-5 w-5" />
                <span className="sr-only">{isListening ? "Stop Listening" : "Start Voice Input"}</span>
              </Button>
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Textarea
                        id="query"
                        placeholder={
                            activeReportContext 
                                ? `Ask about "${activeReportContext.reportName || 'this report'}"...`
                                : imagePreviewForUpload 
                                    ? "Optional: Add a question about the prescription..." 
                                    : "Describe symptoms or ask for a remedy..."
                        }
                        className="min-h-[40px] max-h-[100px] resize-none text-sm rounded-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 border-slate-300 dark:border-slate-600 focus-visible:ring-primary dark:focus-visible:ring-blue-500"
                        rows={1}
                        {...field}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (canSubmit) {
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
              <Button type="submit" className="btn-premium rounded-full w-10 h-10 p-0 flex items-center justify-center" size="icon" disabled={isLoading || !canSubmit}>
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
      </div>
    </div>
  );
}

