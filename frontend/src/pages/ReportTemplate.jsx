import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportTemplate() {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/reports/${reportId}`);
        setReport(res.data);
      } catch (err) {
        toast.error("Failed to load report data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (reportId) fetchReport();
  }, [reportId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (!report || !report.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 font-medium">Report not found.</div>
      </div>
    );
  }

  const { data } = report;

  return (
    <div className="min-h-screen bg-white">
      {/* Print Button - Hidden when printing */}
      <div className="fixed top-6 right-6 print:hidden">
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white font-bold rounded-xl shadow-lg hover:bg-brand-700 hover:shadow-xl transition-all"
        >
          <Printer className="w-5 h-5" />
          Save as PDF
        </button>
      </div>

      {/* Report Document */}
      <div className="max-w-4xl mx-auto px-8 py-12 md:py-20 text-slate-800 font-sans print:px-0 print:py-0 print:max-w-none">
        
        {/* Header / Letterhead */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-8 h-8 text-brand-700" />
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Mānak AI</h1>
            </div>
            <p className="text-sm font-semibold text-slate-500 tracking-widest uppercase">Intelligent Compliance Assistant</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500 font-mono">Date: {new Date().toLocaleDateString()}</p>
            <p className="text-sm text-slate-500 font-mono mt-1">Ref: {reportId.slice(-8).toUpperCase()}</p>
            <p className="text-sm text-slate-500 font-mono mt-1">User: {report.user_email}</p>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-4xl font-black text-slate-900 mb-10 leading-tight">
          {data.title || "Compliance Consultation Report"}
        </h2>

        {/* Executive Summary */}
        <section className="mb-12">
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2 mb-4">
            Executive Summary
          </h3>
          <p className="text-slate-700 leading-relaxed text-lg">
            {data.executive_summary}
          </p>
        </section>

        {/* Action Items */}
        <section className="mb-12">
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2 mb-6">
            Recommended Action Items
          </h3>
          <div className="space-y-4">
            {data.action_items && data.action_items.length > 0 ? (
              data.action_items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-slate-800 text-lg leading-relaxed">{item}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic">No specific action items generated.</p>
            )}
          </div>
        </section>

        {/* Standards Cited */}
        <section className="mb-16 print:break-inside-avoid">
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2 mb-6">
            Standards & References
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.standards_cited && data.standards_cited.length > 0 ? (
              data.standards_cited.map((std, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="font-mono font-bold text-brand-800">{std}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic">No specific IS standards were cited in this session.</p>
            )}
          </div>
        </section>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-slate-200 text-center text-sm text-slate-500 print:fixed print:bottom-8 print:w-full">
          <p>This report was generated automatically by Mānak AI based on user consultation.</p>
          <p className="mt-1">For official BIS guidelines, always refer to www.bis.gov.in.</p>
        </div>
        
      </div>
    </div>
  );
}
