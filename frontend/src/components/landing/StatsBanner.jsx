import React from 'react';
import { STATS } from '../../data/mockData';
import { Database, Network, Target, Zap } from 'lucide-react';

export default function StatsBanner() {
  const statIcons = [Database, Network, Target, Zap];

  return (
    <section className="bg-slate-900 text-white py-16 border-y border-slate-800 relative overflow-hidden">
      {/* Background glow overlay */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {STATS.map((stat, idx) => {
            const Icon = statIcons[idx] || Database;
            return (
              <div key={idx} className={`flex flex-col items-center justify-center ${idx > 0 ? 'pt-6 md:pt-0' : ''}`}>
                <div className="flex items-center gap-1.5 text-brand-400 mb-2">
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">{stat.sub}</span>
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-slate-300">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
