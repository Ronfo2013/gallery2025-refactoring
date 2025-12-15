/**
 * ProgressSteps Component
 *
 * Visualizza lo stato di avanzamento multi-step per operazioni complesse
 * come signup, payment, upload batch, etc.
 */

import React from 'react';
import { CheckCircle, Circle, XCircle, Loader } from 'lucide-react';

export type StepStatus = 'pending' | 'in-progress' | 'completed' | 'error';

export interface Step {
  /**
   * Label del step
   */
  label: string;

  /**
   * Stato corrente del step
   */
  status: StepStatus;

  /**
   * Messaggio di errore (opzionale, mostrato se status = 'error')
   */
  errorMessage?: string;
}

interface ProgressStepsProps {
  /**
   * Array di step da visualizzare
   */
  steps: Step[];

  /**
   * Orientamento (default: vertical)
   */
  orientation?: 'vertical' | 'horizontal';

  /**
   * Classe CSS custom
   */
  className?: string;
}

/**
 * ProgressSteps component
 *
 * @example
 * const [steps, setSteps] = useState<Step[]>([
 *   { label: 'Validazione dati', status: 'completed' },
 *   { label: 'Creazione account', status: 'in-progress' },
 *   { label: 'Invio email', status: 'pending' }
 * ]);
 *
 * <ProgressSteps steps={steps} />
 */
export function ProgressSteps({
  steps,
  orientation = 'vertical',
  className = '',
}: ProgressStepsProps) {
  const isVertical = orientation === 'vertical';

  const containerClasses = isVertical
    ? 'flex flex-col space-y-4'
    : 'flex items-center space-x-4';

  return (
    <div className={`progress-steps ${containerClasses} ${className}`}>
      {steps.map((step, index) => (
        <div
          key={index}
          className={`step flex items-start ${isVertical ? 'w-full' : 'flex-col items-center'}`}
        >
          {/* Icon */}
          <div className="flex-shrink-0">
            {step.status === 'completed' && (
              <CheckCircle className="w-6 h-6 text-green-500" />
            )}
            {step.status === 'in-progress' && (
              <Loader className="w-6 h-6 text-blue-500 animate-spin" />
            )}
            {step.status === 'error' && (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
            {step.status === 'pending' && (
              <Circle className="w-6 h-6 text-gray-300" />
            )}
          </div>

          {/* Label & Error */}
          <div className={`${isVertical ? 'ml-3' : 'mt-2 text-center'} flex-1`}>
            <p
              className={`text-sm font-medium ${
                step.status === 'completed'
                  ? 'text-gray-900'
                  : step.status === 'in-progress'
                    ? 'text-blue-600'
                    : step.status === 'error'
                      ? 'text-red-600'
                      : 'text-gray-400'
              }`}
            >
              {step.label}
            </p>

            {step.status === 'error' && step.errorMessage && (
              <p className="text-xs text-red-500 mt-1">{step.errorMessage}</p>
            )}
          </div>

          {/* Connector line (vertical only, not on last item) */}
          {isVertical && index < steps.length - 1 && (
            <div className="ml-3 mt-2 border-l-2 border-gray-200 h-8"></div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Hook helper per gestire progress steps
 *
 * @example
 * const { steps, updateStep, resetSteps } = useProgressSteps([
 *   { label: 'Step 1', status: 'pending' },
 *   { label: 'Step 2', status: 'pending' }
 * ]);
 *
 * updateStep(0, 'completed');
 * updateStep(1, 'in-progress');
 */
export function useProgressSteps(initialSteps: Step[]) {
  const [steps, setSteps] = React.useState<Step[]>(initialSteps);

  const updateStep = React.useCallback((index: number, status: StepStatus, errorMessage?: string) => {
    setSteps((prev) =>
      prev.map((step, i) =>
        i === index ? { ...step, status, errorMessage } : step
      )
    );
  }, []);

  const resetSteps = React.useCallback(() => {
    setSteps(initialSteps);
  }, [initialSteps]);

  const setAllPending = React.useCallback(() => {
    setSteps((prev) =>
      prev.map((step) => ({ ...step, status: 'pending' as StepStatus }))
    );
  }, []);

  return { steps, updateStep, resetSteps, setAllPending, setSteps };
}

export default ProgressSteps;
