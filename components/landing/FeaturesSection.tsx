/**
 * Features Section - Dynamic Landing Page Component
 */

import React from 'react';
import { LandingFeaturesSettings } from '../../types';
import * as LucideIcons from 'lucide-react';

interface FeaturesSectionProps {
  data: LandingFeaturesSettings;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ data }) => {
  // Sort items by order
  const sortedItems = [...data.items].sort((a, b) => a.order - b.order);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{data.title}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{data.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {sortedItems.map((feature) => {
            // Check if icon is a Lucide icon name or emoji
            const isLucideIcon = /^[A-Z]/.test(feature.icon);
            const IconComponent = isLucideIcon ? (LucideIcons as any)[feature.icon] : null;

            return (
              <div
                key={feature.id}
                className="p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 text-3xl">
                  {IconComponent ? (
                    <IconComponent className="text-white" size={28} />
                  ) : (
                    <span>{feature.icon}</span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
