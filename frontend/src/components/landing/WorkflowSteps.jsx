import React from 'react';
import { WORKFLOW_STEPS } from '../../data/mockData';
import { Search, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';

export default function WorkflowSteps({ onStepClick }) {
  const stepIcons = [Search, Cpu, CheckCircle2];

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider mb-3">
            Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Zero to verified compliance in seconds
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            How geotechnical consultants, EPC contractors, and structural engineers accelerate regulatory checks.
          </p>
        </div>

        {/* 3 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {WORKFLOW_STEPS.map((step, idx) => {
            const Icon = stepIcons[idx] || Search;
            return (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative group hover:border-brand-400 hover:shadow-lg transition-all"
              >
                {/* Step Number Badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-3xl font-black text-brand-600">
                    {step.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-brand-50 text-slate-600 group-hover:text-brand-600 flex items-center justify-center transition">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {step.name}
                </h3>
                <p className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-3">
                  {step.title}
                </p>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
