import React from 'react';
import { FEATURES } from '../../data/standardData';
import { Search, FileText, Network, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function FeaturesGrid({ setCurrentView }) {
  const iconMap = {
    Search: Search,
    FileText: FileText,
    Network: Network,
    ShieldCheck: ShieldCheck,
  };

  const handleCardClick = (id) => {
    if (id === 'cross-ref') {
      setCurrentView('comparison');
    } else if (id === 'doc-intel') {
      setCurrentView('reader');
    } else if (id === 'compliance') {
      setCurrentView('dashboard');
    } else {
      setCurrentView('reader');
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Engineered for regulatory depth
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Purpose-built neural architectures trained on Indian Standards, civil codes, metallurgical handbooks, and BIS technical gazettes.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feat) => {
            const Icon = iconMap[feat.icon] || Search;
            return (
              <div
                key={feat.id}
                onClick={() => handleCardClick(feat.id)}
                className="group relative bg-slate-50/70 hover:bg-white rounded-2xl p-6 border border-slate-200 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-white group-hover:bg-brand-600 text-brand-600 group-hover:text-white shadow-sm border border-slate-200 group-hover:border-brand-600 flex items-center justify-center transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-500 group-hover:text-brand-700 group-hover:border-brand-200">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2.5 group-hover:text-brand-700 transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-200/60 flex items-center text-xs font-bold text-brand-600 group-hover:text-brand-700">
                  <span>Explore capability</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
