import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Layers, 
  LayoutDashboard, 
  FileText, 
  Palette, 
  Sparkles, 
  Menu, 
  X, 
  ShieldCheck, 
  User,
  ChevronRight,
  Zap
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ currentView, setCurrentView, onSearchSelect }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { id: 'landing', label: 'Standards', icon: Search },

    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },

  ];

  const handleNavClick = (viewId) => {
    setCurrentView(viewId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div 
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">BIS Intelligence</span>
                <span className="bg-brand-50 text-brand-700 border border-brand-200 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  v2.4 AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Regulatory Search & Verification Engine</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-full border border-slate-200/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-brand-700 shadow-sm shadow-slate-300 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="bg-brand-600 text-white text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <button 
                  onClick={() => handleNavClick('dashboard')}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-[10px]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span>Dashboard</span>
                </button>
                <button 
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition"
                >
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-5 py-2 rounded-lg shadow-sm shadow-brand-500/30 transition"
              >
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-2 shadow-xl animate-in slide-in-from-top-2 z-50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => handleNavClick('dashboard')}
              className="flex-1 text-center py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
            >
              Dr. Sharma (Dashboard)
            </button>
            
          </div>
        </div>
      )}
    </header>
  );
}
