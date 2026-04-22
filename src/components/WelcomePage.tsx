import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ImageIcon, Code, Plane, Music, Lightbulb, Zap, Plus, ChevronDown, Mic, PanelLeft, SendHorizonal } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface SuggestionChipProps {
  icon: React.ReactNode;
  text: string;
  onClick: (text: string) => void;
  delay: number;
}

function SuggestionChip({ icon, text, onClick, delay }: SuggestionChipProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      onClick={() => onClick(text)}
      className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm shrink-0"
    >
      <span className="text-slate-500">{icon}</span>
      <span className="whitespace-nowrap">{text}</span>
    </motion.button>
  );
}

interface WelcomePageProps {
  onSuggestionClick: (text: string) => void;
  userName?: string;
  onSend: (text: string) => void;
}

export function WelcomePage({ onSuggestionClick, onSend }: WelcomePageProps) {
  const [inputValue, setInputValue] = useState('');

  const greeting = useMemo(() => {
    const greetings = ['Hi', 'Hello', 'Ram Ram'];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }, []);

  const suggestions = [
    { icon: <Sparkles size={16} className="text-pink-500" />, text: "Explore IPL Fan Zone" },
    { icon: <ImageIcon size={16} className="text-orange-500" />, text: "Create image" },
    { icon: <Music size={16} className="text-purple-500" />, text: "Create music" },
    { icon: <Lightbulb size={16} className="text-yellow-500" />, text: "Help me learn" },
    { icon: <Zap size={16} className="text-blue-500" />, text: "Boost my day" },
  ];

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSend(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] w-full max-w-4xl mx-auto px-4">
      {/* Upgrade Banner Mockup */}
      <div className="absolute top-4 right-8 flex items-center gap-4">
        <button className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold hover:bg-blue-100 transition-colors">
          <Sparkles size={14} className="fill-blue-700" />
          Upgrade to Google AI Plus
        </button>
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
          <PanelLeft size={20} />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full text-left mb-8 px-4 md:px-12"
      >
        <h1 className="text-2xl font-medium text-slate-400 mb-1">{greeting}</h1>
        <h2 className="text-5xl font-medium text-slate-800 tracking-tight">
          Where should we start?
        </h2>
      </motion.div>

      {/* Main Input Box (Gemini Style) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="w-full px-4 md:px-12 mb-8"
      >
        <div className="bg-slate-50 rounded-[32px] border border-slate-200 p-6 shadow-sm focus-within:shadow-md focus-within:border-slate-300 transition-all relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Gemini"
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none outline-none text-xl placeholder:text-slate-400 mb-6 pr-12"
          />
          
          <button 
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            className={cn(
              "absolute top-6 right-8 p-3 rounded-full transition-all",
              inputValue.trim() ? "bg-slate-900 text-white shadow-md hover:scale-105" : "text-slate-300"
            )}
          >
            <SendHorizonal size={20} />
          </button>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4 text-slate-500">
              <button className="hover:text-slate-900 transition-colors"><Plus size={20} /></button>
              <button className="flex items-center gap-1 hover:text-slate-900 transition-colors text-sm font-medium">
                <PanelLeft size={18} />
                Tools
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer">
                Fast <ChevronDown size={14} />
              </div>
              <button className="text-slate-500 hover:text-slate-900 transition-colors"><Mic size={20} /></button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Suggestion Chips */}
      <div className="w-full px-4 md:px-12 mb-12">
        <div className="flex flex-wrap justify-center gap-3">
          {suggestions.map((item, i) => (
            <SuggestionChip
              key={i}
              icon={item.icon}
              text={item.text}
              onClick={onSuggestionClick}
              delay={0.4 + i * 0.05}
            />
          ))}
        </div>
      </div>

      {/* Footer Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="text-center text-[10px] text-slate-400 leading-relaxed tracking-tight"
      >
        <p className="uppercase font-medium">AI generated content may contain errors. Trust your brother CXN.</p>
        <p className="mt-1">© 2026 CXN CHAUHAN X NUMBERDAR BY DUSHYANT CHUAHAN (NUMBERDAR). All Rights Reserved.</p>
      </motion.div>
    </div>
  );
}
