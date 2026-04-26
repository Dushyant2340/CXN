import { motion } from 'motion/react';
import { Loader2, ChevronRight } from 'lucide-react';

export function ThinkingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 ml-13"
    >
      <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200/60 rounded-full w-fit shadow-sm">
        <div className="relative group cursor-pointer flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-slate-400 flex items-center justify-center"
          >
            <Loader2 size={14} strokeWidth={3} />
          </motion.div>
          
          <div className="flex items-center gap-1">
            <span className="text-[12px] font-medium text-slate-500">Thinking...</span>
            <ChevronRight size={12} className="text-slate-300" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-3 w-[250px] bg-slate-100 rounded-full" 
        />
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          className="h-3 w-[150px] bg-slate-100 rounded-full" 
        />
      </div>
    </motion.div>
  );
}
