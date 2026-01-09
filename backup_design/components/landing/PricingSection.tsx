/**
 * Pricing Section - Dynamic Landing Page Component
 */

import React from 'react';
import { Check } from 'lucide-react';
import { LandingPricingSettings } from '../../types';

interface PricingSectionProps {
  data: LandingPricingSettings;
  accentColor?: string;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  data,
  accentColor = '#3b82f6',
}) => {
  // Sort plans by order
  const sortedPlans = [...data.plans].sort((a, b) => a.order - b.order);

  const getIntervalText = (interval: string) => {
    switch (interval) {
      case 'monthly':
        return '/month';
      case 'yearly':
        return '/year';
      case 'one-time':
        return 'one-time';
      default:
        return '';
    }
  };

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{data.title}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{data.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {sortedPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl scale-105 border-4 border-white'
                  : 'bg-white border-2 border-gray-200 hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <h3
                className={`text-2xl font-bold mb-2 ${
                  plan.highlighted ? 'text-white' : 'text-gray-900'
                }`}
              >
                {plan.name}
              </h3>

              <div className="mb-6">
                <span
                  className={`text-5xl font-bold ${
                    plan.highlighted ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {plan.currency === 'EUR' ? '€' : '$'}
                  {plan.price}
                </span>
                <span className={`text-lg ${plan.highlighted ? 'text-blue-100' : 'text-gray-500'}`}>
                  {getIntervalText(plan.interval)}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check
                      className={`flex-shrink-0 mt-0.5 ${
                        plan.highlighted ? 'text-green-300' : 'text-green-500'
                      }`}
                      size={20}
                    />
                    <span className={plan.highlighted ? 'text-blue-50' : 'text-gray-700'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-4 rounded-lg font-semibold transition hover:opacity-90 ${
                  plan.highlighted
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'text-white hover:shadow-lg'
                }`}
                style={{
                  backgroundColor: plan.highlighted ? undefined : accentColor,
                }}
              >
                {plan.ctaText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
