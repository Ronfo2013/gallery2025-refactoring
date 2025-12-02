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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-700/50 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-gray-400">Enter credentials to access admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors disabled:opacity-50"
              placeholder="admin@gallery.local"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors disabled:opacity-50"
              placeholder="Enter admin password"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email.trim() || !password.trim()}
            className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Spinner size="h-5 w-5" />
                Verifying...
              </>
            ) : (
              'Access Admin Panel'
            )}
          </button>
        </form>

        {onResetPassword && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={openResetModal}
              className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
            >
              Password dimenticata?
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>🔒 Secure admin access with Firebase Authentication</p>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md animate-slide-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
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
              <h2 className="text-2xl font-bold text-white mb-2">Recupera Password</h2>
              <p className="text-gray-400 text-sm">
                Inserisci la tua email per ricevere il link di reset
              </p>
            </div>

            {!resetSuccess ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label
                    htmlFor="reset-email"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={resetLoading}
                    className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
                    placeholder="admin@gallery.local"
                    autoComplete="email"
                  />
                </div>

                {resetError && (
                  <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
                    {resetError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeResetModal}
                    disabled={resetLoading}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading || !resetEmail.trim()}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {resetLoading ? (
                      <>
                        <Spinner size="h-5 w-5" />
                        Invio...
                      </>
                    ) : (
                      'Invia Email'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-400"
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
                <h3 className="text-xl font-semibold text-white mb-2">Email Inviata!</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Controlla la tua casella email per il link di reset della password.
                  <br />
                  <span className="text-xs text-gray-500 mt-2 block">
                    (Controlla anche lo spam)
                  </span>
                </p>
                <button
                  onClick={closeResetModal}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Chiudi
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
