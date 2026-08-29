import React from 'react';
import { TESTIMONIALS } from '../../data/mockData';
import { Quote, Star } from 'lucide-react';

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider mb-3">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            What compliance leaders say
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Trusted by chief engineers, geotechnical experts, and EPC compliance auditors across India.
          </p>
        </div>

        {/* 2 Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {TESTIMONIALS.map((t, idx) => (
            <div 
              key={idx}
              className="bg-slate-50/70 rounded-2xl p-8 border border-slate-200 shadow-sm relative flex flex-col justify-between hover:border-brand-300 hover:bg-white transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                    {t.badge}
                  </span>
                </div>

                <p className="text-slate-700 text-base leading-relaxed mb-8 italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-200/80">
                <div className="w-11 h-11 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{t.author}</h4>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
