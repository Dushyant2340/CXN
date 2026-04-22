import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface ChatMessageProps {
  role: 'user' | 'model';
  content: string;
  image?: string;
}

export function ChatMessage({ role, content, image }: ChatMessageProps) {
  const isAI = role === 'model';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-4 w-full",
        isAI ? "justify-start" : "justify-end"
      )}
    >
      {isAI && (
        <div className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-1 shadow-md">
          CXN
        </div>
      )}

      <div className={cn(
        "flex flex-col gap-2 max-w-[85%]",
        !isAI && "items-end"
      )}>
        {image && (
          <img 
            src={image} 
            alt="User uploaded" 
            className="max-w-[280px] rounded-2xl border border-gray-100 shadow-sm"
          />
        )}
        
        <div className={cn(
          "px-5 py-3 rounded-2xl text-[15px] leading-[1.6]",
          isAI 
            ? "text-slate-900 pt-1" 
            : "bg-slate-100 text-slate-900 shadow-sm"
        )}>
          {isAI ? (
            <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-slate prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-200">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{content}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
