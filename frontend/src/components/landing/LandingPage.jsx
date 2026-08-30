import React from 'react';
import HeroSection from './HeroSection';
import FeaturesGrid from './FeaturesGrid';
import WorkflowSteps from './WorkflowSteps';

export default function LandingPage({ setCurrentView }) {
  return (
    <div className="flex flex-col">
      <HeroSection 
        onSearchSelect={(view) => setCurrentView(view)} 
        onCompareClick={() => setCurrentView('comparison')}
      />
      <FeaturesGrid setCurrentView={setCurrentView} />
      <WorkflowSteps onStepClick={(view) => setCurrentView(view)} />
    </div>
  );
}
