import React from 'react';
import { TRUSTED_ORGANIZATIONS } from '../../data/standardData';
import { Landmark, Building2, GraduationCap, Factory, ShieldCheck, HardHat } from 'lucide-react';

export default function TrustBanner() {
  const iconMap = {
    Landmark: Landmark,
    Building2: Building2,
    GraduationCap: GraduationCap,
    Factory: Factory,
    ShieldCheck: ShieldCheck,
    HardHat: HardHat,
  };

  return (
    <div className="py-8 bg-slate-100/60 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-6">
          Trusted by operators, EPC leaders and regulatory agencies
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6 items-center justify-center">
          {TRUSTED_ORGANIZATIONS.map((org, index) => {
            const Icon = iconMap[org.icon] || Landmark;
            return (
              <div 
                key={index}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/70 border border-slate-200/70 shadow-sm hover:border-brand-300 hover:shadow transition group"
              >
                <Icon className="w-5 h-5 text-slate-500 group-hover:text-brand-600 transition mb-1.5" />
                <span className="text-xs font-bold text-slate-800 tracking-tight text-center">
                  {org.name}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {org.category}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
