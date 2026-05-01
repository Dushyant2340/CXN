import { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatMessage as ChatMessageComp } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { sendMessageStream, ChatMessage, MessagePart, fileToBase64, ChatSession, speakText, generateImage } from './services/gemini';
import { storage } from './services/storage';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from './lib/utils';
import { ThinkingIndicator } from './components/ThinkingIndicator';
import { WelcomePage } from './components/WelcomePage';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './lib/AuthContext';
import { dbService } from './lib/dbService';

interface AppChatMessage extends ChatMessage {
  fileInfo?: {
    preview: string;
    type: string;
    name: string;
  }[];
}

export default function App() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AppChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTTSActive, setIsTTSActive] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-3-flash-preview");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load Sessions
  useEffect(() => {
    const loadData = async () => {
      let loadedSessions: ChatSession[] = [];
      if (user) {
        // Load from Firestore
        try {
          loadedSessions = await dbService.getSessions(user.uid);
        } catch (err) {
          console.error("Firestore error, falling back to local:", err);
          loadedSessions = storage.getSessions();
        }
      } else {
        // Load from LocalStorage
        loadedSessions = storage.getSessions();
      }
      
      setSessions(loadedSessions);
      if (loadedSessions.length > 0) {
        loadSession(loadedSessions[0].id);
      } else {
        startNewChat();
      }
    };
    loadData();
  }, [user]);

  const scrollToBottom = () => {
    if (scrollRef.current && messages.length > 0) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const saveCurrentSession = async (updatedMessages: any[]) => {
    if (!currentSessionId || updatedMessages.length === 0) return;

    const firstUserMsg = updatedMessages.find(m => m.role === 'user');
    const title = firstUserMsg 
      ? (firstUserMsg.parts.find((p: any) => p.text)?.text?.slice(0, 30) || 'New Chat') 
      : 'Bhai AI help...';

    const session: ChatSession = {
      id: currentSessionId,
      title: title.endsWith('...') ? title : `${title}...`,
      messages: updatedMessages,
      createdAt: Date.now()
    };

    if (user) {
      await dbService.saveSession(user.uid, session);
      const newSessions = await dbService.getSessions(user.uid);
      setSessions(newSessions);
    } else {
      storage.saveSession(session);
      setSessions(storage.getSessions());
    }
  };

  const handleSend = async (text: string, files: File[]) => {
    const currentParts: MessagePart[] = [];
    let fileInfo: AppChatMessage['fileInfo'] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const base64 = await fileToBase64(file);
        currentParts.push({
          inlineData: {
            mimeType: file.type,
            data: base64
          }
        });
        fileInfo.push({
          preview: URL.createObjectURL(file),
          type: file.type,
          name: file.name
        });
      }
    }

    if (text.trim()) {
      currentParts.push({ text: text.trim() });
    }

    if (currentParts.length === 0) return;

    const userMsg: AppChatMessage = {
      role: 'user',
      parts: currentParts,
      fileInfo
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    // Image Gen (Dummy for now as configured in gemini.ts)
    const imageGenRegex = /(bana|generate|create|dhikha|show).*(image|photo|picture|tasveer|pic)/i;
    const isImageGen = text && imageGenRegex.test(text);

    if (isImageGen && text.length > 5) {
      const imageUrl = await generateImage(text);
      if (imageUrl) {
        const aiMsg: AppChatMessage = {
          role: 'model',
          parts: [{ text: "Bhai, ye rahi aapki image! Kaisi lagi? 🔥" }],
          fileInfo: [{
            preview: imageUrl,
            type: 'image/jpeg',
            name: 'Generated Image'
          }]
        };
        const finalMessages = [...newMessages, aiMsg];
        setMessages(finalMessages);
        saveCurrentSession(finalMessages);
        setIsLoading(false);
        return;
      }
    }

    const historyForAPI = messages.map(({ role, parts }) => ({ role, parts }));
    
    let aiResponse = "";
    const aiMsgPlaceholder: ChatMessage = { role: 'model', parts: [{ text: "" }] };
    setMessages(prev => [...prev, aiMsgPlaceholder]);

    try {
      const stream = sendMessageStream(historyForAPI, currentParts, selectedModel);
      for await (const chunk of stream) {
        aiResponse += chunk;
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { role: 'model', parts: [{ text: aiResponse }] };
          return newMsgs;
        });
      }

      const finalMessages = [...newMessages, { role: 'model', parts: [{ text: aiResponse }] }];
      saveCurrentSession(finalMessages);

      if (isTTSActive && aiResponse) {
        speakText(aiResponse);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    const id = Date.now().toString();
    setCurrentSessionId(id);
    setMessages([]);
  };

  const loadSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setCurrentSessionId(id);
      setMessages(session.messages as AppChatMessage[]);
    }
  };

  const deleteSession = async (id: string) => {
    if (user) {
      await dbService.deleteSession(id);
      const remaining = await dbService.getSessions(user.uid);
      setSessions(remaining);
    } else {
      storage.deleteSession(id);
      const remaining = storage.getSessions();
      setSessions(remaining);
    }
    
    if (currentSessionId === id) {
      startNewChat();
    }
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <audio ref={audioRef} hidden />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      <Sidebar 
        onNewChat={startNewChat} 
        sessions={sessions}
        currentSessionId={currentSessionId || undefined}
        onSelectSession={loadSession}
        onDeleteSession={deleteSession}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        className="hidden md:flex" 
      />

      <main className="flex-1 flex flex-col relative h-full">
        {/* Header Bar */}
        <header className="h-16 border-b border-slate-100 flex items-center justify-between px-6 md:px-8 bg-white/80 backdrop-blur-sm z-30 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-slate-900">CXN Active Mode</span>
          </div>
          <div className="flex gap-2 items-center">
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-slate-50 border border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-900 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-200 transition-all cursor-pointer"
            >
              <option value="gemini-3-flash-preview">Flash Preview</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
            </select>
            <button 
              onClick={() => setIsTTSActive(!isTTSActive)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-bold uppercase tracking-wider transition-all",
                isTTSActive 
                  ? "bg-slate-900 text-white border-slate-900" 
                  : "bg-slate-50 text-slate-400 border-slate-100"
              )}
            >
              {isTTSActive ? <Volume2 size={14} /> : <VolumeX size={14} />}
              {isTTSActive ? 'ON' : 'OFF'}
            </button>
            <button 
              onClick={startNewChat}
              className="md:hidden text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white px-3 py-1.5 rounded-full hover:bg-slate-800 transition-colors"
            >
              New Chat
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className={cn(
            "flex-1 overflow-y-auto px-5 scrollbar-hide pb-40",
            messages.length > 0 ? "md:px-[20%] pt-10" : "flex items-center justify-center pt-0"
          )}
        >
          {messages.length === 0 ? (
            <WelcomePage 
              onSuggestionClick={(text) => handleSend(text, [])} 
              onSend={(text) => handleSend(text, [])}
            />
          ) : (
            <div className="flex flex-col gap-10">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <ChatMessageComp
                    key={i}
                    role={msg.role}
                    content={msg.parts.find(p => p.text)?.text || ""}
                    fileInfo={msg.fileInfo}
                  />
                ))}
              </AnimatePresence>
              
              {isLoading && (messages.length === 0 || (messages[messages.length - 1].role === 'user')) && (
                <ThinkingIndicator />
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <AnimatePresence shadow-none>
          {messages.length > 0 && (
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="absolute bottom-0 w-full bg-gradient-to-t from-white via-white to-transparent pt-20 pb-0 shadow-sm z-20"
            >
              <ChatInput onSend={handleSend} isLoading={isLoading} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}




