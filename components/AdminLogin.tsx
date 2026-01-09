import React, { useState } from 'react';
import Spinner from './Spinner';

interface AdminLoginProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onResetPassword?: (email: string) => Promise<void>;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onResetPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Inserisci email e password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onLogin(email, password);
      // Success - il componente padre gestirà il redirect
    } catch (err: any) {
      setError(err.message || 'Errore durante il login');
      setPassword(''); // Clear password on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetError('Inserisci la tua email');
      return;
    }

    if (!onResetPassword) {
      setResetError('Funzione di reset password non disponibile');
      return;
    }

    setResetLoading(true);
    setResetError('');
    setResetSuccess(false);

    try {
      await onResetPassword(resetEmail);
      setResetSuccess(true);
    } catch (err: any) {
      setResetError(err.message || 'Errore durante il reset della password');
    } finally {
      setResetLoading(false);
    }
  };

  const openResetModal = () => {
    setShowResetModal(true);
    setResetEmail(email); // Pre-fill con email del form login
    setResetError('');
    setResetSuccess(false);
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetEmail('');
    setResetError('');
    setResetSuccess(false);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6 w-full group animate-scale-in">
        <div className="text-center mb-10">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-accent-rose blur-xl opacity-30 animate-pulse" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-accent-rose to-accent-pink rounded-2xl flex items-center justify-center shadow-2xl border border-white/20">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight uppercase">
            Admin Access
          </h1>
          <p className="text-gray-500 font-medium tracking-wide text-xs uppercase">
            Secure Authentication Gateway
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-xs font-bold text-gray-400 mb-1 ml-1 uppercase tracking-widest"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="glass-input w-full"
            placeholder="admin@gallery.local"
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-xs font-bold text-gray-400 mb-1 ml-1 uppercase tracking-widest"
          >
            Identity Key
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="glass-input w-full"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl p-4 text-sm animate-shake">
            <div className="flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !email.trim() || !password.trim()}
          className="btn-neon-rose w-full mt-4 !py-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <Spinner size="h-5 w-5" />
              <span>Verificando...</span>
            </>
          ) : (
            <>
              <span className="text-lg">⚡</span>
              <span>Proprietario Accesso</span>
            </>
          )}
        </button>

        {onResetPassword && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={openResetModal}
              className="text-xs font-bold text-accent-indigo hover:text-white transition-all uppercase tracking-widest"
            >
              Password dimenticata?
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
            🔒 encrypted & self-hosted
          </p>
        </div>
      </form>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-night-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card p-10 max-w-md w-full border-white/20 animate-scale-in">
            <div className="text-center mb-8">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-accent-indigo blur-xl opacity-30" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-accent-indigo to-accent-violet rounded-2xl flex items-center justify-center shadow-lg border border-white/20 mx-auto">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
                Recovery System
              </h2>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                Insert protocol address
              </p>
            </div>

            {!resetSuccess ? (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="reset-email"
                    className="block text-xs font-bold text-gray-400 ml-1 uppercase tracking-widest"
                  >
                    Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={resetLoading}
                    className="glass-input w-full"
                    placeholder="admin@gallery.local"
                  />
                </div>

                {resetError && (
                  <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs">
                    {resetError}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={resetLoading || !resetEmail.trim()}
                    className="btn-neon-indigo w-full !py-3.5"
                  >
                    {resetLoading ? 'Sending...' : 'Richiedi Reset'}
                  </button>
                  <button
                    type="button"
                    onClick={closeResetModal}
                    disabled={resetLoading}
                    className="text-xs font-bold text-gray-500 hover:text-white transition-all uppercase tracking-widest mt-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="w-20 h-20 mx-auto mb-6 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30">
                  <svg
                    className="w-10 h-10 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">
                  Access Link Sent!
                </h3>
                <p className="text-gray-500 text-sm font-medium mb-8">
                  Protocol established. Check your digital terminal (and spam).
                </p>
                <button onClick={closeResetModal} className="btn-neon-rose w-full">
                  Return to Base
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
