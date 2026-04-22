import { useState, useRef, ChangeEvent, KeyboardEvent, useEffect } from 'react';
import { Camera, SendHorizonal, X, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

// Types for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

interface ChatInputProps {
  onSend: (text: string, file: File | null) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'hi-IN'; // Set to Hindi for Hinglish support

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText((prev) => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = () => {
    if ((!text.trim() && !selectedFile) || isLoading) return;
    onSend(text, selectedFile);
    setText('');
    removeFile();
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-10">
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="mb-4 relative inline-block"
          >
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="h-24 w-auto rounded-xl border-2 border-white shadow-lg object-cover"
            />
            <button
              onClick={removeFile}
              className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 shadow-md hover:bg-gray-800 transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn(
        "bg-white border rounded-[28px] p-2 flex items-center gap-2 shadow-xl shadow-slate-100 transition-all",
        isLoading ? "opacity-70 pointer-events-none" : "border-slate-200 focus-within:border-slate-300",
        isListening && "border-green-400 ring-2 ring-green-100"
      )}>
        <input
          type="file"
          ref={fileInputRef}
          hidden
          accept="image/*"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-full transition-colors text-slate-400 group shrink-0"
          title="Attach image"
        >
          <Camera size={20} className="group-hover:text-slate-900 transition-colors" />
        </button>

        <button
          onClick={toggleListening}
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-full transition-all shrink-0",
            isListening ? "bg-green-100 text-green-600 animate-pulse" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
          )}
          title={isListening ? "Stop listening" : "Start voice typing"}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={isListening ? "Bolo bhai, sun raha hoon..." : "Yahan likhein bhai..."}
          className="flex-1 bg-transparent border-none outline-none py-3 px-1 text-[16px] placeholder:text-slate-300"
        />

        <button
          onClick={handleSend}
          disabled={(!text.trim() && !selectedFile) || isLoading}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0",
            (!text.trim() && !selectedFile)
              ? "bg-slate-100 text-slate-400"
              : "bg-black text-white hover:scale-105 active:scale-95 shadow-md"
          )}
        >
          <SendHorizonal size={18} />
        </button>
      </div>
      
      <div className="text-center text-[10px] text-slate-400 mt-4 leading-relaxed tracking-tight">
        <p className="uppercase font-medium">AI generated content may contain errors. Trust your brother CXN.</p>
        <p className="mt-1">© 2026 CXN CHAUHAN X NUMBERDAR BY DUSHYANT CHUAHAN (NUMBERDAR). All Rights Reserved.</p>
      </div>
    </div>
  );
}
