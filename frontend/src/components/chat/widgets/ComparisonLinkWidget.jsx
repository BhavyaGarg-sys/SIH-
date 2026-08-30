import React from 'react';
import { ArrowRightLeft, ExternalLink } from 'lucide-react';

export default function ComparisonLinkWidget({ data }) {
  if (!data || !data.comparison_id) return null;

  const handleOpenComparison = () => {
    window.open(`/comparison/${data.comparison_id}`, '_blank');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 my-4 max-w-sm shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
          <ArrowRightLeft className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-1 leading-tight">
            {data.title || "Amendment Comparison"}
          </h4>
          <p className="text-xs text-slate-500 mb-4 line-clamp-2">
            A side-by-side comparison of the recent changes is ready for your review.
          </p>
          <button 
            onClick={handleOpenComparison}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition"
          >
            View Comparison <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
