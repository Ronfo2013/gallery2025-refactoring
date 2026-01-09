import { logger } from '@/utils/logger';
import { sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { isSuperAdmin } from '../../services/platform/platformService';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const { login, user, isLoading } = useFirebaseAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get where to redirect after login (from state or default)
  const _from = (location.state as any)?.from?.pathname || null;

  useEffect(() => {
    // If user is already logged in, redirect them based on role
    if (user && !isLoading) {
      handleRoleRedirection(user.uid);
    }
  }, [user, isLoading]);

  const handleRoleRedirection = async (uid: string) => {
    try {
      // First check if superadmin
      const isSA = await isSuperAdmin(uid);
      if (isSA) {
        logger.info('👤 SuperAdmin detected, redirecting...');
        navigate('/superadmin');
        return;
      }

      // Then check if cliente (superuser)
      const superUserDoc = await getDoc(doc(db, 'superusers', uid));
      if (superUserDoc.exists()) {
        logger.info('👤 Cliente detected, redirecting...');
        navigate('/dashboard');
        return;
      }

      // If no specialized role found, default to landing
      logger.warn('⚠️ No role found for user, redirecting to home');
      navigate('/');
    } catch (err) {
      logger.error('❌ Error during role detection:', err);
      setError('Errore durante la verifica del ruolo utente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) {
      return;
    }

    setError(null);
    setResetSuccess(false);
    setIsLoggingIn(true);

    try {
      const success = await login(email, password);
      if (success) {
        // Redirection is handled by the useEffect above
      }
    } catch (err: any) {
      setError(err.message || 'Credenziali non valide');
      setIsLoggingIn(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Inserisci la tua email per recuperare la password');
      return;
    }

    setError(null);
    setResetSuccess(false);
    setIsResetting(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setResetSuccess(true);
      setShowResetPassword(false);
      logger.info('✅ Email di reset password inviata a:', email);
    } catch (err: any) {
      logger.error('❌ Errore durante il reset password:', err);
      if (err.code === 'auth/user-not-found') {
        setError('Email non trovata nel sistema');
      } else if (err.code === 'auth/invalid-email') {
        setError('Email non valida');
      } else {
        setError("Errore durante l'invio dell'email di reset");
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-white">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -top-32 -right-10 h-96 w-96 rounded-full bg-accent-indigo/20 blur-[140px]" />
        <div className="absolute bottom-[-5rem] left-1/4 h-80 w-80 rounded-full bg-accent-rose/15 blur-[150px]" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex flex-col items-center gap-2 group">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-accent-indigo via-accent-violet to-accent-purple flex items-center justify-center text-white font-black text-2xl border border-white/20 shadow-2xl group-hover:scale-105 transition-transform">
              CG
            </div>
            <h2 className="text-3xl font-display font-black tracking-tight text-white group-hover:text-glow-indigo transition-all">
              ClubGallery
            </h2>
          </Link>
        </div>
        <h2 className="text-center text-xl font-medium text-slate-400 mb-8">Area Riservata</h2>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card !bg-white/5 !backdrop-blur-2xl !border-white/10 py-10 px-6 shadow-2xl sm:rounded-3xl sm:px-12 border">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 placeholder-slate-500 text-white shadow-sm focus:border-accent-indigo focus:outline-none focus:ring-accent-indigo sm:text-sm transition-all"
                  placeholder="admin@esempio.it"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  className="text-xs font-medium text-accent-indigo hover:text-accent-violet transition-colors"
                >
                  Password dimenticata?
                </button>
              </div>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required={!showResetPassword}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 placeholder-slate-500 text-white shadow-sm focus:border-accent-indigo focus:outline-none focus:ring-accent-indigo sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Reset Password Section */}
            {showResetPassword && (
              <div className="rounded-xl bg-accent-indigo/10 border border-accent-indigo/20 p-4">
                <p className="text-sm text-slate-300 mb-3">
                  Inserisci la tua email e ti invieremo un link per reimpostare la password.
                </p>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={isResetting}
                  className="w-full flex justify-center py-2.5 px-4 border border-accent-indigo/30 rounded-lg text-sm font-semibold text-white bg-accent-indigo/20 hover:bg-accent-indigo/30 focus:outline-none focus:ring-2 focus:ring-accent-indigo transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResetting ? (
                    <div className="flex items-center gap-2">
                      <div className="spinner spinner-xs border-white/30 border-t-white"></div>
                      <span>Invio in corso...</span>
                    </div>
                  ) : (
                    'Invia Email di Reset'
                  )}
                </button>
              </div>
            )}

            {/* Success Message */}
            {resetSuccess && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-emerald-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-emerald-500">
                      Email inviata! Controlla la tua casella di posta.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-rose-500">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoggingIn || showResetPassword}
                className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-xl text-sm font-bold text-white bg-gradient-to-r from-accent-indigo to-accent-violet hover:from-accent-violet hover:to-accent-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-indigo transition-all duration-300 ${isLoggingIn || showResetPassword ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
              >
                {isLoggingIn ? (
                  <div className="flex items-center gap-2">
                    <div className="spinner spinner-xs border-white/30 border-t-white"></div>
                    <span>Accesso in corso...</span>
                  </div>
                ) : (
                  'Accedi'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <Link
              to="/"
              className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              ← Torna alla Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
