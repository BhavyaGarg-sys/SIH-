import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Printer } from 'lucide-react';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';

export default function ReportTemplate() {
  const { id: reportId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef(null);

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

  useEffect(() => {
    if (!loading && report && report.data) {
      setTimeout(() => {
        handleDownloadPdf();
      }, 800);
    }
  }, [loading, report]);

  const handleDownloadPdf = () => {
    if (!contentRef.current) return;
    
    const opt = {
      margin:       [10, 0, 10, 0], // Top, Right, Bottom, Left margins in mm
      filename:     `Manak_AI_Report_${reportId.slice(-6)}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().from(contentRef.current).set(opt).save();
  };

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
    <div className="min-h-screen bg-slate-100 py-10">
      <div className="fixed top-6 right-6">
        <button 
          onClick={handleDownloadPdf}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white font-bold rounded-xl shadow-lg hover:bg-brand-700 hover:shadow-xl transition-all"
        >
          <Printer className="w-5 h-5" />
          Download PDF
        </button>
      </div>

      <div 
        ref={contentRef} 
        className="max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-xl px-12 py-16 text-slate-800 font-sans"
      >
        
        {/* Header / Letterhead */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white font-black text-xl border-2 border-brand-500 shadow-sm">
                M
              </div>
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
        <section className="mb-12 html2pdf__page-break-avoid">
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2 mb-4">
            Executive Summary
          </h3>
          <p className="text-slate-700 leading-relaxed text-lg">
            {data.executive_summary}
          </p>
        </section>

        {/* Key Findings */}
        <section className="mb-12 html2pdf__page-break-avoid">
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2 mb-6">
            Key Regulatory Findings
          </h3>
          <ul className="list-disc pl-6 space-y-3 text-slate-700 text-lg">
            {data.key_findings && data.key_findings.length > 0 ? (
              data.key_findings.map((item, idx) => (
                <li key={idx} className="leading-relaxed">{item}</li>
              ))
            ) : (
              <p className="text-slate-500 italic ml-[-24px]">No specific findings generated.</p>
            )}
          </ul>
        </section>

        {/* Action Items */}
        <section className="mb-12">
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2 mb-6">
            Recommended Action Items
          </h3>
          <div className="space-y-4">
            {data.action_items && data.action_items.length > 0 ? (
              data.action_items.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 html2pdf__page-break-avoid">
                  <div className="mt-1">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 text-brand-600 font-bold text-sm border-2 border-brand-500">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic">No specific action items generated.</p>
            )}
          </div>
        </section>

        {/* Required Documents */}
        <section className="mb-12 html2pdf__page-break-avoid">
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2 mb-6">
            Required Documents
          </h3>
          <ul className="list-disc pl-6 space-y-3 text-slate-700 text-lg">
            {data.required_documents && data.required_documents.length > 0 ? (
              data.required_documents.map((item, idx) => (
                <li key={idx} className="leading-relaxed">{item}</li>
              ))
            ) : (
              <p className="text-slate-500 italic ml-[-24px]">No specific documents were identified.</p>
            )}
          </ul>
        </section>

        {/* Risk Factors */}
        {data.risk_factors && data.risk_factors.length > 0 && (
          <section className="mb-12 p-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg html2pdf__page-break-avoid">
            <h3 className="text-lg font-bold text-red-900 uppercase tracking-wide mb-4">
              Compliance Risks & Warnings
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-red-800 text-md">
              {data.risk_factors.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-slate-200 text-center text-sm text-slate-500 html2pdf__page-break-avoid">
          <p>This report was generated automatically by Mānak AI based on user consultation.</p>
          <p className="mt-1">For official BIS guidelines, always refer to www.bis.gov.in.</p>
        </div>
        
      </div>
    </div>
  );
}
