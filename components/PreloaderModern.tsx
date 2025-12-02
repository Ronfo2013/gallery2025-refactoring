import React, { useState, useEffect } from 'react';
import { useBrand } from '../contexts/BrandContext';

interface PreloaderModernProps {
  progress?: number; // 0-100
  variant?: 'circular' | 'linear' | 'dots';
}

/**
 * Modern Preloader Component
 * Professional loading screen with multiple variants
 */
const PreloaderModern: React.FC<PreloaderModernProps> = ({ progress, variant = 'circular' }) => {
  const { brand } = useBrand();
  const [currentProgress, setCurrentProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('Loading configuration...');

  // Simulate progress if not provided
  useEffect(() => {
    if (progress === undefined) {
      const interval = setInterval(() => {
        setCurrentProgress((prev) => {
          if (prev >= 90) {
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 300);
      return () => clearInterval(interval);
    } else {
      setCurrentProgress(progress);
    }
  }, [progress]);

  // Update loading step based on progress
  useEffect(() => {
    if (currentProgress < 30) {
      setLoadingStep('Loading configuration...');
    } else if (currentProgress < 60) {
      setLoadingStep('Preparing gallery...');
    } else if (currentProgress < 90) {
      setLoadingStep('Loading images...');
    } else {
      setLoadingStep('Almost ready!');
    }
  }, [currentProgress]);

  const brandName = brand?.name || 'Photo Gallery';
  const primaryColor = brand?.branding?.primaryColor || '#3b82f6';

  // Circular Variant
  if (variant === 'circular') {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-[100]"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
        }}
      >
        <div className="text-center animate-scale-in">
          {/* Logo */}
          <div className="mb-8 animate-float">
            {brand?.branding?.logo ? (
              <img
                src={brand?.branding?.logo}
                alt={brandName}
                className="w-32 h-32 mx-auto object-contain"
              />
            ) : (
              <div className="w-32 h-32 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Circular Progress */}
          <svg className="w-40 h-40 mx-auto mb-6" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="6"
            />
            {/* Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="white"
              strokeWidth="6"
              strokeDasharray={`${currentProgress * 2.827} 283`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dasharray 0.3s ease' }}
            />
            {/* Percentage Text */}
            <text x="50" y="55" textAnchor="middle" className="text-3xl font-bold fill-white">
              {Math.round(currentProgress)}%
            </text>
          </svg>

          {/* Loading Text */}
          <p className="text-white text-xl font-medium mb-2 animate-pulse">{brandName}</p>
          <p className="text-white/80 text-sm">{loadingStep}</p>
        </div>
      </div>
    );
  }

  // Linear Variant
  if (variant === 'linear') {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[100]">
        {/* Logo */}
        <div className="mb-12 animate-scale-in">
          {brand?.branding?.logo ? (
            <img
              src={brand?.branding?.logo}
              alt={brandName}
              className="w-40 h-40 animate-pulse object-contain"
            />
          ) : (
            <div className="w-40 h-40 bg-gray-100 rounded-2xl flex items-center justify-center animate-pulse">
              <svg
                className="w-20 h-20 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Progress Bar Container */}
        <div className="w-96 max-w-md slide-up">
          {/* Progress Bar */}
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${currentProgress}%`,
                background: `linear-gradient(90deg, ${primaryColor} 0%, ${primaryColor}cc 100%)`,
              }}
            >
              {/* Shimmer Effect */}
              <div
                className="absolute inset-0 animate-shimmer"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                }}
              />
            </div>
          </div>

          {/* Percentage */}
          <div className="text-center mt-6">
            <span className="text-4xl font-bold text-gray-900">{Math.round(currentProgress)}%</span>
          </div>

          {/* Loading Steps */}
          <div className="mt-4 text-gray-600 text-sm text-center animate-pulse">{loadingStep}</div>
        </div>

        {/* Brand Name */}
        <div className="mt-12 text-gray-900 text-xl font-semibold">{brandName}</div>
      </div>
    );
  }

  // Dots Variant
  if (variant === 'dots') {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-[100]"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        }}
      >
        <div className="text-center">
          {/* Brand Logo */}
          <div className="mb-16 animate-scale-in">
            {brand?.branding?.logo ? (
              <img
                src={brand?.branding?.logo}
                alt={brandName}
                className="w-48 h-48 mx-auto opacity-90 object-contain"
              />
            ) : (
              <div className="w-48 h-48 mx-auto glass-dark rounded-3xl flex items-center justify-center">
                <svg
                  className="w-24 h-24 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Animated Dots */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <div
              className="w-5 h-5 rounded-full animate-bounce"
              style={{
                animationDelay: '0ms',
                backgroundColor: primaryColor,
              }}
            />
            <div
              className="w-5 h-5 rounded-full animate-bounce"
              style={{
                animationDelay: '150ms',
                backgroundColor: primaryColor,
              }}
            />
            <div
              className="w-5 h-5 rounded-full animate-bounce"
              style={{
                animationDelay: '300ms',
                backgroundColor: primaryColor,
              }}
            />
          </div>

          {/* Text */}
          <p className="text-white text-2xl font-medium mb-2">{brandName}</p>
          <p className="text-blue-300 text-sm animate-pulse">{loadingStep}</p>
        </div>
      </div>
    );
  }

  return null;
};

export default PreloaderModern;
