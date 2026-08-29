import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './components/landing/LandingPage';
import ComparisonView from './components/comparison/ComparisonView';
import DashboardView from './components/dashboard/DashboardView';
import DocumentReaderView from './components/reader/DocumentReaderView';
import DesignSystemView from './components/design-system/DesignSystemView';
import { Layers, Sparkles, LayoutDashboard, FileText, Palette, Search } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentView = location.pathname === '/' ? 'landing' : location.pathname.substring(1).split('/')[0];

  const setCurrentView = (view) => {
    if (view === 'landing') navigate('/');
    else navigate(\/\\);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickJumpButtons = [
    { id: '', label: '1. Landing Page', icon: Search },
    { id: 'comparison', label: '2. AI Compare Report', icon: Layers },
    { id: 'dashboard', label: '3. Engineer Dashboard', icon: LayoutDashboard },
    { id: 'reader', label: '4. IS 800 Standard Reader', icon: FileText },
    { id: 'design-system', label: '5. Design System Spec', icon: Palette },
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
          {quickJumpButtons.map((btn) => {
            const Icon = btn.icon;
            const isActive = currentView === (btn.id || 'landing');
            return (
              <Link
                key={btn.id}
                to={/\}
                className={\lex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition \\}
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
          <Route path="/comparison" element={<ComparisonView setCurrentView={setCurrentView} />} />
          <Route path="/dashboard" element={<DashboardView setCurrentView={setCurrentView} />} />
          <Route path="/reader" element={<DocumentReaderView setCurrentView={setCurrentView} />} />
          <Route path="/reader/:projectId" element={<DocumentReaderView setCurrentView={setCurrentView} />} />
          <Route path="/design-system" element={<DesignSystemView setCurrentView={setCurrentView} />} />
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
