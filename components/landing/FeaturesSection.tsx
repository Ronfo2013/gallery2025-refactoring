/**
 * Features Section - Dynamic Landing Page Component
 */

import * as LucideIcons from 'lucide-react';
import React from 'react';
import { LandingFeaturesSettings } from '../../types';

interface FeaturesSectionProps {
  data: LandingFeaturesSettings;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ data }) => {
  // Sort items by order
  const sortedItems = [...data.items].sort((a, b) => a.order - b.order);

  return (
    <section className="py-32 relative overflow-hidden bg-night-950">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-accent-indigo/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent-rose/10 blur-[120px] rounded-full" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="text-center mb-24 max-w-3xl mx-auto animate-fade-in">
          <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-accent-indigo uppercase tracking-[0.3em] mb-6">
            Everything you need
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-8 leading-tight">
            {data.title}
          </h2>
          <p className="text-xl text-gray-400 font-medium leading-relaxed">{data.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {sortedItems.map((feature, index) => {
            // Check if icon is a Lucide icon name or emoji
            const isLucideIcon = /^[A-Z]/.test(feature.icon);
            const IconComponent = isLucideIcon ? (LucideIcons as any)[feature.icon] : null;

            return (
              <div
                key={feature.id}
                className="glass-card glass-card-hover p-10 group animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative z-10 group-hover:bg-accent-indigo/10 group-hover:border-accent-indigo/30 transition-all duration-500 overflow-hidden">
                    {IconComponent ? (
                      <IconComponent
                        className="text-white group-hover:text-accent-indigo group-hover:scale-110 transition-all duration-500"
                        size={32}
                      />
                    ) : (
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-500">
                        {feature.icon}
                      </span>
                    )}
                    {/* Inner Glow */}
                    <div className="absolute top-0 left-0 w-full h-full bg-accent-indigo opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500" />
                  </div>
                  {/* Outer Glow */}
                  <div className="absolute top-0 left-0 w-16 h-16 bg-accent-indigo/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4 group-hover:text-accent-indigo transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed font-medium group-hover:text-gray-300 transition-colors duration-300 italic">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
