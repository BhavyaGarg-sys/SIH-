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
    <header style={{ padding: '15px 30px', background: '#0f172a', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <ShieldCheck size={26} color="#3b82f6" />
          <h1 style={{ margin: 0, color: 'white', fontSize: '20px', letterSpacing: '-0.5px' }}>MānaK AI</h1>
        </div>
        
        <nav style={{ display: 'flex', gap: '20px' }}>
          <div 
            onClick={() => navigate('/dashboard')} 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', background: isDashboard ? 'rgba(255,255,255,0.1)' : 'transparent', color: isDashboard ? 'white' : '#94a3b8', transition: 'all 0.2s', fontWeight: isDashboard ? '600' : 'normal' }}
          >
            <LayoutDashboard size={16} /> Workspaces
          </div>
          <div 
            onClick={() => navigate('/chat')} 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', background: isChat ? 'rgba(255,255,255,0.1)' : 'transparent', color: isChat ? 'white' : '#94a3b8', transition: 'all 0.2s', fontWeight: isChat ? '600' : 'normal' }}
          >
            <MessageSquare size={16} /> AI Research
          </div>
        </nav>
      </div>
      
      <button 
        onClick={() => { logout(); navigate('/'); }} 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s' }}
        onMouseOver={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = 'white'; }}
        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; }}
      >
        <LogOut size={14} /> Sign Out
      </button>
    </header>
  );
}
