import React from 'react';
import HeroSection from './HeroSection';
import TrustBanner from './TrustBanner';
import FeaturesGrid from './FeaturesGrid';
import WorkflowSteps from './WorkflowSteps';
import StatsBanner from './StatsBanner';
import Testimonials from './Testimonials';
import PricingTiers from './PricingTiers';

export default function LandingPage({ setCurrentView }) {
  return (
    <div className="flex flex-col">
      <HeroSection 
        onSearchSelect={(view) => setCurrentView(view)} 
        onCompareClick={() => setCurrentView('comparison')}
      />
      <TrustBanner />
      <FeaturesGrid setCurrentView={setCurrentView} />
      <WorkflowSteps onStepClick={(view) => setCurrentView(view)} />
      <StatsBanner />
      <Testimonials />
      <PricingTiers onSelectPlan={(plan) => {
        alert(`Selected ${plan} plan. Redirecting to checkout portal.`);
      }} />
    </div>
  );
}
