import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './components/landing/LandingPage';
import ComparisonView from './components/comparison/ComparisonView';
import DashboardView from './components/dashboard/DashboardView';
import DocumentReaderView from './components/reader/DocumentReaderView';
import DesignSystemView from './components/design-system/DesignSystemView';
import Login from './pages/Login';
import ProjectWorkspace from './pages/ProjectWorkspace';
import Bookmarks from './pages/Bookmarks';
import OldDashboard from './pages/OldDashboard';
import { Layers, Sparkles, LayoutDashboard, FileText, Palette, Search, Bookmark, Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (!user) {
    window.location.href = '/login';
    return null;
  }
  return children;
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentView = location.pathname === '/' ? 'landing' : location.pathname.substring(1).split('/')[0];

  const setCurrentView = (view) => {
    if (view === 'landing') navigate('/');
    else navigate(`/${view}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickJumpButtons = [
    { id: '', label: '1. Landing Page', icon: Search },
    { id: 'comparison', label: '2. AI Compare Report', icon: Layers },
    { id: 'dashboard', label: '3. Engineer Dashboard', icon: LayoutDashboard },
    { id: 'reader', label: '4. IS 800 Standard Reader', icon: FileText },
    { id: 'design-system', label: '5. Design System Spec', icon: Palette },
    { id: 'old-dashboard', label: 'Legacy Dashboard', icon: LayoutDashboard },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
      
      {/* Top Prototype Navigation Pill Bar (Quick View Switcher) */}
      <aside aria-label="Demo View Switcher" className="bg-slate-950 text-slate-300 px-4 py-2 text-xs border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="font-mono font-bold text-white text-[11px]">BIS Intelligence Prototype Explorer:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Link to="/login" className="px-2 py-1 bg-brand-600 text-white rounded font-bold text-[10px]">LOGIN</Link>
          {quickJumpButtons.map((btn) => {
            const Icon = btn.icon;
            const isActive = currentView === (btn.id || 'landing');
            return (
              <Link
                key={btn.id}
                to={`/${btn.id}`}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                  isActive
                    ? 'bg-brand-600 text-white font-bold shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{btn.label}</span>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Main Navigation Header */}
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Dynamic View Component */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage setCurrentView={setCurrentView} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/comparison" element={<ComparisonView setCurrentView={setCurrentView} />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardView setCurrentView={setCurrentView} /></ProtectedRoute>} />
          <Route path="/reader" element={<DocumentReaderView setCurrentView={setCurrentView} />} />
          <Route path="/reader/:projectId" element={<DocumentReaderView setCurrentView={setCurrentView} />} />
          <Route path="/design-system" element={<DesignSystemView setCurrentView={setCurrentView} />} />
          <Route path="/workspace/:id" element={<ProtectedRoute><ProjectWorkspace /></ProtectedRoute>} />
          <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
          <Route path="/old-dashboard" element={<ProtectedRoute><OldDashboard /></ProtectedRoute>} />
        </Routes>
      </main>

      {/* Global Footer */}
      <Footer setCurrentView={setCurrentView} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <Toaster position="bottom-right" />
      </Router>
    </AuthProvider>
  );
}
