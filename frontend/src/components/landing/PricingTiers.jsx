import React, { useState } from 'react';
import { PRICING_TIERS } from '../../data/mockData';
import { Check, Sparkles, Zap, Shield, ArrowRight } from 'lucide-react';

export default function PricingTiers({ onSelectPlan }) {
  const [annualBilling, setAnnualBilling] = useState(false);

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider mb-3">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Tiers for every research scale
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mb-6">
            Transparent licensing for individual consultants, engineering bureaus, and multinational EPCs.
          </p>

          {/* Billing Switch */}
          <div className="inline-flex items-center gap-3 bg-white p-1.5 rounded-full border border-slate-200 shadow-sm">
            <button
              onClick={() => setAnnualBilling(false)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                !annualBilling
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setAnnualBilling(true)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                annualBilling
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {PRICING_TIERS.map((tier, idx) => {
            const price = tier.priceCustom 
              ? tier.priceCustom 
              : annualBilling 
                ? `₹${tier.priceAnnual.toLocaleString('en-IN')}` 
                : tier.priceMonthly === 0 
                  ? 'Free' 
                  : `₹${tier.priceMonthly.toLocaleString('en-IN')}`;

            return (
              <div
                key={idx}
                className={`relative rounded-2xl bg-white p-8 flex flex-col justify-between transition-all duration-300 ${
                  tier.popular
                    ? 'border-2 border-brand-600 shadow-xl shadow-brand-500/10 ring-4 ring-brand-500/5 lg:-translate-y-2'
                    : 'border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Popular Pill */}
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                    {tier.badge}
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">{tier.target}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="my-6 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                        {price}
                      </span>
                      {tier.priceMonthly !== null && tier.priceMonthly !== 0 && (
                        <span className="text-xs font-semibold text-slate-500">
                          {annualBilling ? '/ month, billed yearly' : '/ month'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                        <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => onSelectPlan && onSelectPlan(tier.name)}
                  className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    tier.popular
                      ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/30'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
