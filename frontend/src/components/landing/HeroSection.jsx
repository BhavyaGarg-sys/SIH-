import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, BookOpen, Layers, CheckCircle2, Clock } from 'lucide-react';

export default function HeroSection({ onSearchSelect, onCompareClick }) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filterPills = [
    { id: 'all', label: 'All Standards' },
    { id: 'is', label: 'IS Codes' },
    { id: 'sp', label: 'SP Codes' },
    { id: 'recent', label: 'Recent Updates' },
    { id: 'industry', label: 'Industry Matrices' },
  ];

  const suggestions = [
    { code: 'IS 800:2007', title: 'General Construction in Steel — Code of Practice', type: 'reader', tag: 'Active Standard' },
    { code: 'IS 1893:2016 vs IS 13920', title: 'Earthquake Resistance & Ductile Detailing Comparison', type: 'comparison', tag: 'AI Synthesis' },
    { code: 'IS 456:2000', title: 'Plain and Reinforced Concrete — Code of Practice', type: 'reader', tag: 'Civil' },
    { code: 'SP 16:1980', title: 'Design Aids for Reinforced Concrete to IS 456', type: 'reader', tag: 'Handbook' },
  ];

  const filteredSuggestions = suggestions.filter(s => 
    s.code.toLowerCase().includes(query.toLowerCase()) || 
    s.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.toLowerCase().includes('compare') || query.toLowerCase().includes('1893') || query.toLowerCase().includes('13920')) {
      onCompareClick();
    } else {
      onSearchSelect('reader');
    }
  };

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-100/60 via-brand-50/20 to-transparent -z-10 blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-200/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Top Live Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold mb-6 shadow-sm animate-bounce-subtle">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
          </span>
          <span>BIS 2026 Regulatory Harmonization Engine</span>
        </div>

        {/* Main Hero Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
          Search BIS standards faster.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-700">
            Understand them better.
          </span><br />
          Verify every answer.
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          AI-powered semantic search and research across <strong className="text-slate-800 font-semibold">20,000+ BIS standards</strong>, national building codes, and technical regulatory documents.
        </p>

        {/* Search Box Container */}
        <div className="relative max-w-3xl mx-auto mb-6">
          <form 
            onSubmit={handleSearchSubmit}
            className="relative flex items-center bg-white rounded-2xl shadow-xl shadow-slate-200/70 border-2 border-slate-200 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all p-2"
          >
            <div className="pl-3 pr-2 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search standards by number (e.g. IS 800, IS 1893), title, keyword, or ask a question..."
              className="w-full text-sm sm:text-base text-slate-800 placeholder:text-slate-400 bg-transparent border-none outline-none focus:ring-0 py-2 px-1"
            />

            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-md shadow-brand-600/30 hover:shadow-brand-600/50 transition active:scale-95 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>AI Search</span>
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-2xl z-40 text-left overflow-hidden divide-y divide-slate-100">
              <div className="p-2 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                <span>Suggested Codes & Inquiries</span>
                <button 
                  onClick={() => setShowSuggestions(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs normal-case"
                >
                  Close
                </button>
              </div>
              {filteredSuggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setQuery(item.code);
                    setShowSuggestions(false);
                    if (item.type === 'comparison') {
                      onCompareClick();
                    } else {
                      onSearchSelect('reader');
                    }
                  }}
                  className="p-3.5 hover:bg-brand-50/70 cursor-pointer flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-brand-100 text-brand-700 flex items-center justify-center font-mono font-bold text-xs">
                      {item.type === 'comparison' ? <Layers className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900 group-hover:text-brand-700">
                          {item.code}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{item.title}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {filterPills.map((pill) => (
            <button
              key={pill.id}
              onClick={() => {
                setActiveFilter(pill.id);
                if (pill.id === 'is') {
                  setQuery('IS 800:2007');
                }
              }}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
                activeFilter === pill.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
