import React, { useState } from 'react';
import { DESIGN_SYSTEM_TOKENS } from '../../data/mockData';
import { Palette, Type, MousePointerClick, FormInput, LayoutGrid, Tag, Copy, CheckCircle2 } from 'lucide-react';

export default function DesignSystemView() {
  const [copiedHex, setCopiedHex] = useState(null);
  const [demoInputValue, setDemoInputValue] = useState('IS 1893:2016');

  const handleCopyHex = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Design System Header (Image 4) */}
        <div className="mb-10 pb-6 border-b border-slate-200">
          <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1 rounded-md uppercase tracking-wider">
            Reference Guidelines
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 mb-2">
            BIS Intelligence — Design System
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl">
            A comprehensive catalog of typography, color tokens, interactive states, and layout building blocks enforcing aesthetic consistency across BIS Intelligence.
          </p>
        </div>

        {/* Design System Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 1. Color Palette */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Palette className="w-5 h-5 text-brand-600" />
              <h2 className="font-bold text-slate-900 text-base">Color Palette</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DESIGN_SYSTEM_TOKENS.colors.map((c, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCopyHex(c.hex)}
                  className="rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-2xs group"
                >
                  <div className={`h-16 ${c.bg} flex items-center justify-center relative`}>
                    {copiedHex === c.hex && (
                      <span className="bg-black/75 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        Copied!
                      </span>
                    )}
                  </div>
                  <div className="p-2.5 bg-white">
                    <div className="font-bold text-xs text-slate-900 truncate">{c.name}</div>
                    <div className="font-mono text-[11px] text-slate-500 flex items-center justify-between mt-0.5">
                      <span>{c.hex}</span>
                      <Copy className="w-3 h-3 text-slate-400 group-hover:text-brand-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Typography Scale */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Type className="w-5 h-5 text-brand-600" />
              <h2 className="font-bold text-slate-900 text-base">Typography Scale</h2>
            </div>

            <div className="space-y-4">
              {DESIGN_SYSTEM_TOKENS.typography.map((t, idx) => (
                <div key={idx} className="pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.level}
                  </div>
                  <div className={`${t.size} text-slate-900 truncate`}>
                    {t.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Button Actions & States */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MousePointerClick className="w-5 h-5 text-brand-600" />
              <h2 className="font-bold text-slate-900 text-base">Button Actions</h2>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <button className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition">
                  Get Started (Primary)
                </button>
                <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition">
                  Hover / Active State
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button className="border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition">
                  Save Draft (Secondary Outline)
                </button>
                <button className="bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition">
                  Hover Fill
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button disabled className="bg-slate-100 border border-slate-200 text-slate-400 font-semibold text-xs px-4 py-2.5 rounded-xl cursor-not-allowed">
                  Not Available (Disabled State)
                </button>
              </div>
            </div>
          </div>

          {/* 4. Input Fields & Searches */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <FormInput className="w-5 h-5 text-brand-600" />
              <h2 className="font-bold text-slate-900 text-base">Input Fields & Searches</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Standard Input
                </label>
                <input
                  type="text"
                  placeholder="Enter standard designation code..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Active / Focused Input
                </label>
                <input
                  type="text"
                  value={demoInputValue}
                  onChange={(e) => setDemoInputValue(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border-2 border-brand-600 ring-4 ring-brand-500/15 font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 5. Card Layout Templates */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <LayoutGrid className="w-5 h-5 text-brand-600" />
              <h2 className="font-bold text-slate-900 text-base">Card Layout Templates</h2>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 hover:border-brand-400 hover:shadow-md transition bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-xs bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded">
                  IS 1893:2016
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-600">
                  98% Match
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">
                Criteria for Earthquake Resistant Design of Structures
              </h3>
              <p className="text-xs text-slate-500">
                General seismic provisions, dynamic response factors, and zone map calculations.
              </p>
            </div>
          </div>

          {/* 6. Badges & Status Indicators */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Tag className="w-5 h-5 text-brand-600" />
              <h2 className="font-bold text-slate-900 text-base">Badges & Status Indicators</h2>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {DESIGN_SYSTEM_TOKENS.badges.map((b, idx) => (
                <span
                  key={idx}
                  className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg border shadow-2xs ${b.color}`}
                >
                  {b.label}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
