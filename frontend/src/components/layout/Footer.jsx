import React from 'react';
import { BookOpen, ShieldCheck, ExternalLink, Activity, Sparkles, Terminal, FileCode2 } from 'lucide-react';

export default function Footer({ setCurrentView }) {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 pb-10 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">Manak AI</span>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              AI-driven search, contextual synthesis, and absolute compliance resolution across the entire database of 20,000+ Indian Standards (IS, SP, and NBC codes).
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Vector Indexes Synced (20,412 IS Codes)</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => setCurrentView('landing')} className="hover:text-white transition">
                  Standards Search
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('comparison')} className="hover:text-white transition flex items-center gap-1">
                  <span>Cross-Reference Diff Engine</span>
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('reader')} className="hover:text-white transition">
                  Interactive Clause Reader (IS 800)
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('dashboard')} className="hover:text-white transition">
                  Enterprise Workspace API
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('design-system')} className="hover:text-white transition">
                  Design System Guidelines
                </button>
              </li>
            </ul>
          </div>

          {/* Resources & Regulatory Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#docs" onClick={(e) => { e.preventDefault(); setCurrentView('reader'); }} className="hover:text-white transition">
                  Documentation & Schema
                </a>
              </li>
              <li>
                <a href="#codes" onClick={(e) => { e.preventDefault(); setCurrentView('landing'); }} className="hover:text-white transition">
                  IS Codes Master Index
                </a>
              </li>
              <li>
                <a href="#support" onClick={(e) => { e.preventDefault(); alert("Manak AI Helpdesk: support@manak-ai.com"); }} className="hover:text-white transition">
                  Compliance Support Portal
                </a>
              </li>
              <li>
                <a href="#status" onClick={(e) => { e.preventDefault(); setCurrentView('dashboard'); }} className="hover:text-white transition flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>API Status Ticker (99.98%)</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Legal Disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Manak AI Platform. All rights reserved.</p>
          <p className="text-slate-400 text-center sm:text-right max-w-xl">
            Disclaimer: This platform is an independent research tool and engineering helper and is not officially affiliated with the Bureau of Indian Standards.
          </p>
        </div>
      </div>
    </footer>
  );
}
