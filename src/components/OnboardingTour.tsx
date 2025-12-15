/**
 * OnboardingTour Component
 *
 * Tour interattivo per nuovi utenti usando Intro.js (compatibile React 19)
 *
 * Installation:
 * npm install intro.js intro.js-react
 *
 * Alternative: Se preferisci react-joyride (React 18):
 * npm install react-joyride --legacy-peer-deps
 */

import React, { useState, useEffect } from 'react';
import { Steps } from 'intro.js-react';
import 'intro.js/introjs.css';
import './OnboardingTour.css'; // Custom styles

interface OnboardingTourProps {
  /**
   * Se true, avvia automaticamente il tour
   */
  autoStart?: boolean;

  /**
   * Callback quando il tour è completato
   */
  onComplete?: () => void;

  /**
   * Callback quando il tour è saltato
   */
  onSkip?: () => void;
}

const TOUR_STEPS = [
  {
    element: '#create-album-btn',
    intro: 'Inizia creando il tuo primo album per organizzare le tue foto',
    position: 'right',
  },
  {
    element: '#branding-tab',
    intro: 'Personalizza i colori e il logo della tua galleria qui',
    position: 'bottom',
  },
  {
    element: '#settings-tab',
    intro: 'Configura il nome della galleria e altre impostazioni',
    position: 'bottom',
  },
  {
    element: '#backup-section',
    intro: 'Crea backup regolari dei tuoi album per sicurezza',
    position: 'left',
  },
  {
    element: '#copy-link-btn',
    intro: 'Copia il link della galleria per condividerla con i tuoi clienti',
    position: 'left',
  },
];

const STORAGE_KEY = 'hasSeenOnboardingTour';

/**
 * OnboardingTour Component
 *
 * @example
 * // In BrandDashboard.tsx
 * import { OnboardingTour } from '@/components/OnboardingTour';
 *
 * export function BrandDashboard() {
 *   return (
 *     <>
 *       <OnboardingTour autoStart />
 *       {/ * Dashboard content * /}
 *     </>
 *   );
 * }
 */
export function OnboardingTour({
  autoStart = true,
  onComplete,
  onSkip,
}: OnboardingTourProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!autoStart) {
      return;
    }

    // Check se utente ha già visto il tour
    const hasSeenTour = localStorage.getItem(STORAGE_KEY);

    if (!hasSeenTour) {
      // Delay di 1s per permettere render completo
      const timer = setTimeout(() => {
        setEnabled(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [autoStart]);

  const handleExit = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setEnabled(false);
    onComplete?.();
  };

  const handleBeforeExit = (stepIndex: number) => {
    // Se utente salta prima della fine
    if (stepIndex < TOUR_STEPS.length - 1) {
      localStorage.setItem(STORAGE_KEY, 'true');
      onSkip?.();
    }
  };

  return (
    <Steps
      enabled={enabled}
      steps={TOUR_STEPS}
      initialStep={0}
      onExit={handleExit}
      onBeforeExit={handleBeforeExit}
      options={{
        nextLabel: 'Avanti',
        prevLabel: 'Indietro',
        skipLabel: 'Salta',
        doneLabel: 'Fine',
        showProgress: true,
        showBullets: true,
        exitOnOverlayClick: false,
        exitOnEsc: true,
        disableInteraction: true,
        scrollToElement: true,
        overlayOpacity: 0.7,
        tooltipClass: 'onboarding-tour-tooltip',
      }}
    />
  );
}

/**
 * Helper: Restart tour manualmente
 */
export function restartOnboardingTour() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}

/**
 * Helper: Check se tour è stato completato
 */
export function hasCompletedTour(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export default OnboardingTour;
