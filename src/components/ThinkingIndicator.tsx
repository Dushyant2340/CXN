import { motion } from 'motion/react';

export function ThinkingIndicator() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-3 ml-14 group"
    >
      <div className="flex items-center gap-4 px-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex gap-1.5 items-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0.3, 1, 0.3],
                backgroundColor: i === 0 ? '#000' : i === 1 ? '#475569' : '#94a3b8'
              }}
              transition={{ 
                duration: 1.2,
                repeat: Infinity, 
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-2 h-2 rounded-full"
            />
          ))}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-bold text-slate-900 tracking-tight">CXN AI Thinking</span>
          <motion.span 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-[10px] uppercase font-bold tracking-widest text-slate-400"
          >
            Processing bhai...
          </motion.span>
        </div>
      </div>
      
      {/* Decorative pulse ring */}
      <div className="relative w-full h-[2px] bg-slate-50 rounded-full overflow-hidden">
        <motion.div 
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-slate-900 to-transparent opacity-10"
        />
      </div>
    </motion.div>
  );
}
