import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, LayoutDashboard, MessageSquare } from 'lucide-react';

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  
  const isDashboard = location.pathname.includes('/dashboard') || location.pathname.includes('/project');
  const isChat = location.pathname === '/chat';

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-8">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => navigate('/dashboard')}
        >
          <div className="bg-blue-600/20 p-2 rounded-xl group-hover:bg-blue-600/30 transition-colors">
            <ShieldCheck className="w-6 h-6 text-blue-400 group-hover:text-blue-300" />
          </div>
          <h1 className="m-0 text-white text-xl font-bold tracking-tight">MānaK AI</h1>
        </div>
        
        <nav className="hidden md:flex gap-2">
          <button 
            onClick={() => navigate('/dashboard')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
              isDashboard 
                ? 'bg-slate-800 text-white font-semibold shadow-inner' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard size={18} /> Workspaces
          </button>
          <button 
            onClick={() => navigate('/chat')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
              isChat 
                ? 'bg-slate-800 text-white font-semibold shadow-inner' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MessageSquare size={18} /> AI Research
          </button>
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Mobile Navigation */}
        <div className="md:hidden flex gap-2 mr-2">
          <button 
            onClick={() => navigate('/dashboard')} 
            className={`p-2 rounded-lg transition-all ${isDashboard ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
          >
            <LayoutDashboard size={20} />
          </button>
          <button 
            onClick={() => navigate('/chat')} 
            className={`p-2 rounded-lg transition-all ${isChat ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
          >
            <MessageSquare size={20} />
          </button>
        </div>

        <button 
          onClick={() => { logout(); navigate('/'); }} 
          className="flex items-center gap-2 bg-transparent hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group"
        >
          <LogOut size={16} className="text-slate-400 group-hover:text-white transition-colors" /> 
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
