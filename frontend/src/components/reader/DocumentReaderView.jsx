import React, { useState } from 'react';
import axios from 'axios';
import { STANDARD_DETAIL } from '../../data/mockData';
import { 
  BookOpen, 
  Sparkles, 
  FileText, 
  Layers, 
  Copy, 
  CheckCircle2, 
  ChevronRight, 
  ExternalLink, 
  Search, 
  Send, 
  Download, 
  Share2, 
  Bookmark, 
  Table, 
  Info,
  ArrowRight
} from 'lucide-react';

export default function DocumentReaderView({ setCurrentView }) {
  const [activeSectionId, setActiveSectionId] = useState('s4');
  const [customQuestion, setCustomQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'user',
      text: STANDARD_DETAIL.aiCopilot.question
    },
    {
      role: 'assistant',
      text: STANDARD_DETAIL.aiCopilot.response,
      citation: STANDARD_DETAIL.aiCopilot.citationLink
    }
  ]);
  const [tableCopied, setTableCopied] = useState(false);

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    const userQ = customQuestion;
    setCustomQuestion('');
    
    // Append user message
    const newMessages = [...messages, { role: 'user', text: userQ }];
    setMessages(newMessages);

    try {
      // Hit actual backend endpoint
      const response = await axios.post('http://localhost:8000/api/v1/chat/message', {
        message: userQ,
        interaction_mode: "guided_ui",
      });

      const { ai_text, citations } = response.data;
      
      let citationStr = null;
      if (citations && citations.length > 0) {
        citationStr = `${citations[0].standard} Clause ${citations[0].clause}`;
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: ai_text, citation: citationStr }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { role: 'assistant', text: "Sorry, I am having trouble connecting to the backend right now." }]);
    }
  };

  const handleCopyTable = () => {
    const tableData = "Grade\tYield (fy)\tTensile (fu)\tElongation\nFe 410\t250 MPa\t410 MPa\t23%\nFe 440\t290 MPa\t440 MPa\t21%\nFe 490\t350 MPa\t490 MPa\t20%";
    navigator.clipboard.writeText(tableData);
    setTableCopied(true);
    setTimeout(() => setTableCopied(false), 2000);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
          {STANDARD_DETAIL.breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span 
                onClick={() => { if (idx === 0) setCurrentView('landing'); }}
                className={idx === 0 ? 'hover:text-brand-600 cursor-pointer' : idx === STANDARD_DETAIL.breadcrumbs.length - 1 ? 'text-slate-900 font-bold font-mono' : ''}
              >
                {crumb}
              </span>
              {idx < STANDARD_DETAIL.breadcrumbs.length - 1 && (
                <ChevronRight className="w-3 h-3 text-slate-400" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* 3-Column Standard Reader Grid (Image 5 Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Column 1: Left Sticky Table of Contents (~2.5 cols = 20-25%) */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sticky top-20">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-brand-600" />
                <span>Table of Contents</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">8 Sections</span>
            </div>

            <nav className="space-y-1">
              {STANDARD_DETAIL.toc.map((item) => {
                const isActive = activeSectionId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSectionId(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-bold border-l-4 border-brand-600'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono font-normal">
                      {item.clauses} cl.
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
              <button 
                onClick={() => alert("Downloading official BIS Gazette PDF copy")}
                className="w-full py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Standard (135p)</span>
              </button>
            </div>
          </div>

          {/* Column 2: Center Document Reader Body (~6.5 cols = 50-55%) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            
            {/* Header / Standard Title Block */}
            <div className="border-b border-slate-200 pb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md">
                  {STANDARD_DETAIL.code}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {STANDARD_DETAIL.status}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                {STANDARD_DETAIL.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {STANDARD_DETAIL.subtitle}
              </p>

              {/* Metadata strip */}
              <div className="grid grid-cols-3 gap-3 mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-center font-mono">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Pages</div>
                  <div className="text-xs font-bold text-slate-800">{STANDARD_DETAIL.metadata.pages}</div>
                </div>
                <div className="border-x border-slate-200">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Division</div>
                  <div className="text-xs font-bold text-slate-800 truncate px-1">{STANDARD_DETAIL.metadata.division}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">ICS No.</div>
                  <div className="text-xs font-bold text-brand-700">{STANDARD_DETAIL.metadata.icsNo}</div>
                </div>
              </div>
            </div>

            {/* Section Content: 4. General Material Requirements */}
            <div className="space-y-5 text-slate-800 text-sm leading-relaxed">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pt-2">
                <span className="font-mono text-brand-600 font-bold">{STANDARD_DETAIL.activeSection.number}</span>
                <span>{STANDARD_DETAIL.activeSection.heading}</span>
              </h2>

              <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                {STANDARD_DETAIL.activeSection.lead}
              </p>

              {/* TABLE 1 : TENSILE PROPERTIES */}
              <div className="rounded-xl border border-slate-200 overflow-hidden my-4 bg-white shadow-sm">
                <div className="bg-slate-100/90 p-3.5 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-mono font-bold text-xs text-slate-900">
                      {STANDARD_DETAIL.activeSection.table.title}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {STANDARD_DETAIL.activeSection.table.caption}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyTable}
                    className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 bg-white px-2 py-1 rounded border border-slate-200 shadow-2xs transition"
                  >
                    {tableCopied ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{tableCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        {STANDARD_DETAIL.activeSection.table.headers.map((h, i) => (
                          <th key={i} className="p-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {STANDARD_DETAIL.activeSection.table.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-brand-50/30 transition">
                          <td className="p-3 font-bold text-brand-700">{row.grade}</td>
                          <td className="p-3 text-slate-800 font-semibold">{row.fy}</td>
                          <td className="p-3 text-slate-800 font-semibold">{row.fu}</td>
                          <td className="p-3 text-slate-600">{row.el}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Clause Cross-reference note */}
              <div className="p-4 rounded-xl bg-brand-50/60 border border-brand-200 text-xs sm:text-sm text-slate-700 leading-relaxed flex items-start gap-3">
                <Info className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-brand-900">Clause Cross-Reference: </span>
                  {STANDARD_DETAIL.activeSection.clauseNote}
                </div>
              </div>

            </div>

          </div>

          {/* Column 3: Right AI Clause Copilot Panel (~3 cols = 25-30%) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Ask About This Standard Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-600" />
                    <span>Ask about this standard</span>
                  </h3>
                  <span className="text-[10px] font-mono text-brand-600 bg-brand-50 px-2 py-0.5 rounded font-bold">
                    IS 800 Copilot
                  </span>
                </div>

                {/* Conversation History */}
                <div className="space-y-3 mb-4 max-h-80 overflow-y-auto pr-1">
                  {messages.map((msg, mIdx) => (
                    <div key={mIdx} className={`space-y-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                        {msg.role === 'user' ? 'USER' : 'AI RESPONSE'}
                      </span>
                      <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-slate-900 text-white rounded-tr-none'
                          : 'bg-brand-50/70 border border-brand-200 text-slate-800 rounded-tl-none'
                      }`}>
                        <p>{msg.text}</p>
                        {msg.citation && (
                          <div className="mt-2 pt-2 border-t border-brand-200 flex items-center text-[10px] font-mono font-bold text-brand-700">
                            <BookOpen className="w-3 h-3 mr-1" />
                            <a href="#table1" className="hover:underline">{msg.citation}</a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleAskQuestion} className="relative mt-2">
                <input
                  type="text"
                  placeholder="Ask a clause or formula question..."
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  className="w-full text-xs p-2.5 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition"
                >
                  <Send className="w-3 h-3" />
                </button>
              </form>
            </div>

            {/* Related Codes */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-brand-600" />
                  <span>Related Codes</span>
                </h3>
              </div>

              <div className="space-y-2.5">
                {STANDARD_DETAIL.relatedCodes.map((rc, rIdx) => (
                  <div
                    key={rIdx}
                    onClick={() => {
                      if (rc.code.includes('1893') || rc.code.includes('13920')) {
                        setCurrentView('comparison');
                      }
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-slate-50 transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-xs text-brand-700 group-hover:underline">
                        {rc.code}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-600 transition" />
                    </div>
                    <p className="text-xs font-semibold text-slate-800">{rc.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{rc.relation}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
