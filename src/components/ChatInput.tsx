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
  onSend: (text: string, files: File[]) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<{url: string, type: string, name: string}[]>([]);
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
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => ({
        url: URL.createObjectURL(file),
        type: file.type,
        name: file.name
      }));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearFiles = () => {
    previewUrls.forEach(p => URL.revokeObjectURL(p.url));
    setSelectedFiles([]);
    setPreviewUrls([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = () => {
    if ((!text.trim() && selectedFiles.length === 0) || isLoading) return;
    onSend(text, selectedFiles);
    setText('');
    clearFiles();
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
        {previewUrls.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-3">
            {previewUrls.map((preview, idx) => (
              <motion.div
                key={idx + preview.name}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="relative group"
              >
                {preview.type === 'application/pdf' ? (
                  <div className="h-20 w-20 rounded-xl border-2 border-white shadow-lg bg-red-50 flex items-center justify-center flex-col gap-1 overflow-hidden">
                    <div className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">PDF</div>
                    <span className="text-[9px] text-red-700 font-medium truncate px-2 w-full text-center">
                      {preview.name}
                    </span>
                  </div>
                ) : (
                  <img 
                    src={preview.url} 
                    alt="Preview" 
                    className="h-20 w-20 rounded-xl border-2 border-white shadow-lg object-cover text-xs"
                  />
                )}
                <button
                  onClick={() => removeFile(idx)}
                  className="absolute -top-1.5 -right-1.5 bg-black text-white rounded-full p-1 shadow-md hover:bg-gray-800 transition-colors"
                >
                  <X size={10} />
                </button>
              </motion.div>
            ))}
          </div>
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
          multiple
          accept="image/*,.pdf"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-full transition-colors text-slate-400 group shrink-0"
          title="Attach images or PDFs"
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
          disabled={(!text.trim() && selectedFiles.length === 0) || isLoading}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0",
            (!text.trim() && selectedFiles.length === 0)
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
