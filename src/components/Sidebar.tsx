import { MessageSquarePlus, Trash2, LogOut, User as UserIcon, LogIn } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ChatSession } from '../services/gemini';
import { useAuth } from '../lib/AuthContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

interface SidebarProps {
  onNewChat: () => void;
  sessions: ChatSession[];
  currentSessionId?: string;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onOpenAuth: () => void;
  className?: string;
}

export function Sidebar({ 
  onNewChat, 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onDeleteSession,
  onOpenAuth,
  className 
}: SidebarProps) {
  const { user } = useAuth();

  return (
    <aside className={cn("w-64 bg-slate-50 border-r border-slate-200 flex flex-col p-6 h-full transition-all", className)}>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tighter text-slate-900">CXN AI</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
          Chauhan X Numberdar
        </p>
      </div>

      <button
        onClick={onNewChat}
        className="flex items-center gap-3 w-full bg-white border border-slate-200 rounded-lg p-3 text-sm font-medium hover:bg-slate-100 transition-colors shadow-sm mb-6"
      >
        <span className="text-lg">+</span> 
        New Conversation
      </button>

      <nav className="flex-1 overflow-y-auto scrollbar-hide">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Recent Sessions</h3>
        <div className="space-y-1">
          {sessions.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic px-2">No history yet, bhai.</p>
          ) : (
            sessions.map((session) => (
              <div 
                key={session.id}
                className={cn(
                  "group flex items-center justify-between p-2 text-sm rounded-md cursor-pointer transition-all",
                  currentSessionId === session.id 
                    ? "text-slate-900 bg-slate-200/60 border-l-2 border-slate-900 font-semibold" 
                    : "text-slate-500 hover:bg-slate-100"
                )}
                onClick={() => onSelectSession(session.id)}
              >
                <span className="truncate flex-1 pr-2">{session.title}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </nav>

      <div className="border-t border-slate-200 pt-6 mt-4">
        {user ? (
          <div className="flex items-center gap-3 group relative">
            <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-600">
              {user.displayName?.[0] || user.email?.[0] || '?'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[11px] font-bold truncate leading-tight">{user.displayName || 'Bhai Log Member'}</p>
              <p className="text-[10px] text-slate-400 truncate leading-none mt-1">{user.email}</p>
            </div>
            <button 
              onClick={() => signOut(auth)}
              className="p-1.5 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg text-slate-400"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button 
            onClick={onOpenAuth}
            className="flex items-center gap-3 w-full p-2 hover:bg-slate-100 rounded-xl transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <LogIn size={16} />
            </div>
            <span className="text-xs font-bold text-slate-600 group-hover:text-blue-600">Login / Signup</span>
          </button>
        )}
      </div>
    </aside>
  );
}

