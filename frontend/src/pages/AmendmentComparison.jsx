import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, ArrowLeft, ArrowRight, ShieldCheck, FileSearch, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function AmendmentComparison() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/reports/${id}`);
        setReport(res.data);
      } catch (err) {
        toast.error("Failed to load comparison data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (!report || !report.data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="text-slate-500 font-medium mb-4">Comparison not found.</div>
        <button onClick={() => navigate(-1)} className="text-brand-600 font-semibold hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const { data } = report;

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="font-semibold text-sm hidden sm:inline">Back</span>
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-600" />
          <span className="font-bold text-slate-800">Mānak AI</span>
        </div>
        <div className="w-16"></div> {/* Spacer for centering */}
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        
        {/* Title & Overview */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-100 text-brand-600 mb-4 shadow-sm border border-brand-200">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">
            {data.title}
          </h1>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-left">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 mb-2 flex items-center gap-2">
              <FileSearch size={16} /> AI Overview
            </h3>
            <p className="text-slate-700 leading-relaxed text-lg">
              {data.ai_overview}
            </p>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="space-y-8">
          {data.comparisons && data.comparisons.map((comp, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              
              {/* Topic Header */}
              <div className="bg-slate-900 text-white px-6 py-4">
                <h3 className="text-lg font-bold">{comp.topic}</h3>
              </div>

              {/* Side-by-Side Content */}
              <div className="flex flex-col md:flex-row">
                
                {/* Previous Guideline */}
                <div className="flex-1 p-6 bg-red-50/30 md:border-r border-slate-200 border-b md:border-b-0">
                  <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider rounded-md mb-4">
                    Previous Guideline
                  </span>
                  <p className="text-slate-800 text-base leading-relaxed">
                    {comp.old_guideline}
                  </p>
                </div>

                {/* Arrow Divider (Desktop only) */}
                <div className="hidden md:flex items-center justify-center -mx-4 z-10 relative">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400">
                    <ArrowRight size={16} />
                  </div>
                </div>

                {/* Arrow Divider (Mobile only) */}
                <div className="md:hidden flex items-center justify-center -my-4 z-10 relative">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 rotate-90">
                    <ArrowRight size={16} />
                  </div>
                </div>

                {/* New Amendment */}
                <div className="flex-1 p-6 bg-emerald-50/50">
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider rounded-md mb-4">
                    New Amendment
                  </span>
                  <p className="text-slate-800 text-base leading-relaxed font-medium">
                    {comp.new_amendment}
                  </p>
                </div>
              </div>

              {/* Impact Footer */}
              <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-start gap-3">
                <span className="flex-shrink-0 px-2 py-1 bg-brand-100 text-brand-800 text-[10px] font-bold uppercase tracking-widest rounded mt-0.5">
                  Impact
                </span>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {comp.impact}
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
