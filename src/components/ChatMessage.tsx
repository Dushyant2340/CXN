import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

import { FileText } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'model';
  content: string;
  fileInfo?: {
    preview: string;
    type: string;
    name: string;
  }[];
}

export function ChatMessage({ role, content, fileInfo }: ChatMessageProps) {
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
        {fileInfo && fileInfo.length > 0 && (
          <div className={cn(
            "flex flex-wrap gap-2 mb-1",
            !isAI && "justify-end"
          )}>
            {fileInfo.map((file, idx) => (
              <div key={idx}>
                {file.type === 'application/pdf' ? (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-100 p-3 rounded-xl max-w-[240px]">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[10px] font-bold text-red-900 truncate uppercase tracking-tight">{file.name}</span>
                      <span className="text-[9px] text-red-600 font-medium">PDF Document</span>
                    </div>
                  </div>
                ) : (
                  <img 
                    src={file.preview} 
                    alt="Uploaded attachment" 
                    className="max-w-[200px] h-auto rounded-xl border border-gray-100 shadow-sm object-cover"
                  />
                )}
              </div>
            ))}
          </div>
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
