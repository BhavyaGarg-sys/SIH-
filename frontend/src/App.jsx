import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './components/landing/LandingPage';

import DashboardView from './components/dashboard/DashboardView';


import Login from './pages/Login';
import ProjectWorkspace from './pages/ProjectWorkspace';
import ReportTemplate from './pages/ReportTemplate';
import AmendmentComparison from './pages/AmendmentComparison';
import Bookmarks from './pages/Bookmarks';

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
      
      {/* Main Navigation Header */}
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Dynamic View Component */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage setCurrentView={setCurrentView} />} />
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardView setCurrentView={setCurrentView} /></ProtectedRoute>} />


                    <Route path="/workspace/:id" element={<ProtectedRoute><ProjectWorkspace /></ProtectedRoute>} />
          <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
          <Route path="/report/:id" element={<ProtectedRoute><ReportTemplate /></ProtectedRoute>} />
          <Route path="/comparison/:id" element={<ProtectedRoute><AmendmentComparison /></ProtectedRoute>} />
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
