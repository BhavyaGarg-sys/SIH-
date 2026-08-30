import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';

export default function ReportLinkWidget({ data }) {
  if (!data || !data.report_id) return null;

  const handleOpenReport = () => {
    window.open(`/report/${data.report_id}`, '_blank');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 my-4 max-w-sm shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-1 leading-tight">
            {data.title || "Consultation Report"}
          </h4>
          <p className="text-xs text-slate-500 mb-4 line-clamp-2">
            Your chat history has been formatted into a professional report ready for PDF export.
          </p>
          <button 
            onClick={handleOpenReport}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition"
          >
            Open Report <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
