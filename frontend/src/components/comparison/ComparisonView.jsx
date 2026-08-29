import React, { useState } from 'react';
import { COMPARISON_REPORT } from '../../data/mockData';
import { 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  FileSpreadsheet, 
  ExternalLink, 
  HelpCircle, 
  Share2, 
  Download, 
  Layers,
  ArrowRight,
  BookOpen,
  Copy,
  CheckCircle2,
  Filter,
  RefreshCw
} from 'lucide-react';

export default function ComparisonView({ setCurrentView }) {
  const [activeCitation, setActiveCitation] = useState(null);
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [followUpAnswer, setFollowUpAnswer] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loadingNewSynthesis, setLoadingNewSynthesis] = useState(false);

  const handleCitationClick = (citationId) => {
    setActiveCitation(citationId);
  };

  const handleFollowUpClick = (question) => {
    setSelectedFollowUp(question);
    // Simulate AI dynamic response
    if (question.includes('Response Reduction')) {
      setFollowUpAnswer({
        q: question,
        ans: "Under IS 1893 (Table 9), Special Ductile RC Shear Walls (SDSW) paired with ductile framing are assigned an R-factor of 5.0 (Ordinary RC Shear Walls are limited to R=3.0). Using R=5.0 is legally conditional on meeting the boundary-element detailing provisions of IS 13920:2016 Clause 9.",
        clause: "IS 1893:2016 Cl. 6.4.2 & IS 13920:2016 Cl. 9.1"
      });
    } else if (question.includes('weak-beam strong-column')) {
      setFollowUpAnswer({
        q: question,
        ans: "IS 13920:2016 Clause 7.2.1 mandates that the sum of nominal flexural strengths of columns meeting at a joint along each principal axis shall be at least 1.4 times (140%) the sum of nominal flexural strengths of beams framing into that joint.",
        clause: "IS 13920:2016 Cl. 7.2.1 (Strong Column / Weak Beam Rule)"
      });
    } else {
      setFollowUpAnswer({
        q: question,
        ans: "IS 13920:2016 Clause 5.3 strictly limits reinforcing steel in seismic zones III, IV, and V to high-strength deformed bars with elongation >= 14.5% and actual tensile strength >= 1.15x actual yield strength (e.g. Fe 500D, Fe 550D).",
        clause: "IS 13920:2016 Cl. 5.3"
      });
    }
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(`${COMPARISON_REPORT.title}\n\n${COMPARISON_REPORT.executiveSummary}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setLoadingNewSynthesis(true);
    setTimeout(() => {
      setLoadingNewSynthesis(false);
    }, 800);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Active Synthesis Bar (Image 2 style) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                  Active AI Comparative Synthesis
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                {COMPARISON_REPORT.query}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={handleRegenerate}
              disabled={loadingNewSynthesis}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
              title="Regenerate synthesis"
            >
              <RefreshCw className={`w-4 h-4 ${loadingNewSynthesis ? 'animate-spin text-brand-600' : ''}`} />
            </button>
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => alert("Report downloaded in PDF format with regulatory timestamps.")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* 2-Column Main Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Main Report Panel (~8 of 12 cols = ~66-70%) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              
              {/* Report Header Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="bg-brand-50 text-brand-700 border border-brand-200 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {COMPARISON_REPORT.status}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    Generated in {COMPARISON_REPORT.executionTime}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verifiable Sources Citing
                  </span>
                </div>
              </div>

              {/* Report Title */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                {COMPARISON_REPORT.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mb-8 font-medium">
                {COMPARISON_REPORT.subtitle}
              </p>

              {/* 1. Executive Summary */}
              <div className="mb-10">
                <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-800 text-xs flex items-center justify-center font-bold">1</span>
                  <span>Executive Summary</span>
                </h3>
                
                <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 text-sm sm:text-base text-slate-700 leading-relaxed">
                  This report provides a granular comparison of seismic parameters and detailing instructions outlined in{' '}
                  <button 
                    onClick={() => handleCitationClick('1')}
                    className="inline-flex items-center font-mono font-bold text-brand-700 bg-brand-100/70 hover:bg-brand-200 px-1.5 py-0.5 rounded text-xs transition"
                  >
                    IS 1893 (Part 1):2016 <span className="ml-1 text-[10px] bg-brand-600 text-white rounded-full px-1">[1]</span>
                  </button>{' '}
                  (load calculations and zone structures) and{' '}
                  <button 
                    onClick={() => handleCitationClick('2')}
                    className="inline-flex items-center font-mono font-bold text-brand-700 bg-brand-100/70 hover:bg-brand-200 px-1.5 py-0.5 rounded text-xs transition"
                  >
                    IS 13920:2016 <span className="ml-1 text-[10px] bg-brand-600 text-white rounded-full px-1">[2]</span>
                  </button>{' '}
                  (ductile construction specifications for RC members). Together, they form the core regulatory framework governing earthquake safety in severe seismic zones across India. Understanding the hand-shake between design forces and structural reinforcement details is crucial for high-rise compliance.
                </div>
              </div>

              {/* 2. Key Technical Differences Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-800 text-xs flex items-center justify-center font-bold">2</span>
                    <span>Key Technical Differences</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">4 Aspects Synthesized</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-3.5 w-1/4">Aspect</th>
                        <th className="p-3.5 w-3/8 text-brand-800 bg-brand-50/50">IS 1893 (Part 1):2016</th>
                        <th className="p-3.5 w-3/8 text-indigo-900 bg-indigo-50/40">IS 13920:2016</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {COMPARISON_REPORT.differences.map((diff, dIdx) => (
                        <tr key={dIdx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900 align-top">
                            {diff.aspect}
                            <div className="mt-1 text-[10px] text-brand-600 font-medium font-mono">
                              {diff.delta}
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-700 align-top bg-brand-50/20 leading-relaxed">
                            {diff.code1}
                          </td>
                          <td className="p-3.5 text-slate-700 align-top bg-indigo-50/10 leading-relaxed">
                            {diff.code2}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dynamic Follow Up Question Answer Display */}
              {followUpAnswer && (
                <div className="mt-8 p-5 rounded-xl bg-gradient-to-r from-brand-50 via-indigo-50/40 to-white border-2 border-brand-200 animate-in fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-brand-700 font-mono flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI FOLLOW-UP SYNTHESIS
                    </span>
                    <button 
                      onClick={() => setFollowUpAnswer(null)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Dismiss
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">
                    Q: {followUpAnswer.q}
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">
                    {followUpAnswer.ans}
                  </p>
                  <div className="inline-flex items-center gap-1 text-xs font-mono font-bold text-brand-800 bg-white px-2.5 py-1 rounded border border-brand-200 shadow-2xs">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Citation: {followUpAnswer.clause}</span>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right Sidebar (~4 of 12 cols = ~30%) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* CITING SOURCES Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-600" />
                  <span>Citing Sources ({COMPARISON_REPORT.citingSources.length})</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                  Verified Active
                </span>
              </div>

              <div className="space-y-3">
                {COMPARISON_REPORT.citingSources.map((source) => (
                  <div
                    key={source.id}
                    onClick={() => {
                      if (source.code.includes('IS 800')) {
                        setCurrentView('reader');
                      }
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      activeCitation === source.id
                        ? 'border-brand-500 bg-brand-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-brand-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                          [{source.id}]
                        </span>
                        <span className="font-mono font-bold text-xs text-slate-900">
                          {source.code}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-emerald-600">
                        {source.relevance}% Relevance
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2">
                      {source.title}
                    </p>

                    {/* Relevance Meter Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-brand-500 to-emerald-500 h-1.5 rounded-full" 
                        style={{ width: `${source.relevance}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FOLLOW-UP QUESTIONS Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-600" />
                  <span>Follow-Up Inquiries</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Instant AI</span>
              </div>

              <div className="space-y-2.5">
                {COMPARISON_REPORT.followUpQuestions.map((question, qIdx) => (
                  <button
                    key={qIdx}
                    onClick={() => handleFollowUpClick(question)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-brand-400 hover:bg-brand-50/40 text-xs font-medium text-slate-700 hover:text-brand-900 transition flex items-center justify-between group"
                  >
                    <span className="line-clamp-2 leading-snug">{question}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
