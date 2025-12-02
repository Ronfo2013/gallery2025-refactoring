/**
 * DemoBadge - Shown on demo gallery pages
 *
 * Displays a prominent banner indicating demo mode
 * with CTA to create own gallery
 */

import React from 'react';
import { Palette, ArrowRight } from 'lucide-react';

export const DemoBadge: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 shadow-lg">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Palette size={24} className="flex-shrink-0" />
          <div>
            <p className="font-bold text-lg">🎨 Demo Gallery</p>
            <p className="text-sm text-blue-100">Explore all features - No signup required</p>
          </div>
        </div>
        <a
          href="/#/signup"
          className="flex items-center gap-2 bg-white text-blue-600 px-6 py-2.5 rounded-full font-semibold hover:bg-blue-50 transition-all hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap"
        >
          <span>Create Your Own Gallery</span>
          <ArrowRight size={18} />
        </a>
      </div>
    </div>
  );
};
