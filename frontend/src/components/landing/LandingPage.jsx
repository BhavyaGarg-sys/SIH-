import React from 'react';
import HeroSection from './HeroSection';
import TrustBanner from './TrustBanner';
import FeaturesGrid from './FeaturesGrid';
import WorkflowSteps from './WorkflowSteps';

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
    </div>
  );
}
