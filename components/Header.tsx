import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { useBrand } from '../contexts/BrandContext';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { isSuperAdmin as checkIsSuperAdmin } from '../services/platform/platformService';
import { NavLink as NavLinkType } from '../types';
import { DemoBadge } from './demo/DemoBadge';

const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const activeClass =
    'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border-white/20';
  const inactiveClass = 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent';

  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border ${isActive ? activeClass : inactiveClass}`}
    >
      {children}
    </Link>
  );
};

const Header: React.FC = () => {
  const { siteSettings } = useAppContext();
  const { brand } = useBrand();
  const { user, isAuthenticated, logout } = useFirebaseAuth();
  const [isSA, setIsSA] = React.useState(false);

  React.useEffect(() => {
    const detectRole = async () => {
      if (user) {
        const saStatus = await checkIsSuperAdmin(user.uid);
        setIsSA(saStatus);
      } else {
        setIsSA(false);
      }
    };
    detectRole();
  }, [user]);

  const isDemo = brand?.isDemo || brand?.slug === 'demo';

  return (
    <>
      {isDemo && <DemoBadge />}
      <header className="sticky top-0 z-[100] px-4 py-4 md:py-6">
        <div className="container-xl mx-auto">
          <nav className="glass-card !bg-night-900/40 !backdrop-blur-2xl !border-white/10 px-6 py-4 flex items-center justify-between gap-4">
            {/* Logo Section */}
            <Link to="/" className="flex items-center gap-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-accent-indigo blur-lg opacity-40 group-hover:opacity-70 transition-opacity" />
                {siteSettings.logoUrl ? (
                  <img
                    src={siteSettings.logoUrl}
                    alt="Logo"
                    className="relative h-10 w-auto rounded-xl border border-white/20 shadow-2xl"
                  />
                ) : (
                  <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-accent-indigo via-accent-violet to-accent-purple flex items-center justify-center text-white font-black text-sm border border-white/20">
                    CG
                  </div>
                )}
              </div>
              <span className="hidden sm:block font-display font-black text-xl tracking-tight text-white group-hover:text-glow-indigo transition-all">
                {siteSettings.appName}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {siteSettings.navLinks.map((link: NavLinkType) => (
                <NavLink key={link.id} to={link.to}>
                  {link.text}
                </NavLink>
              ))}
            </div>

            {/* CTA Section */}
            <div className="flex items-center gap-3">
              {!isDemo ? (
                <>
                  <Link
                    to="/demo"
                    className="hidden sm:block px-5 py-2.5 rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Demo
                  </Link>
                  {!isAuthenticated ? (
                    <Link to="/login" className="btn-neon-rose !py-2.5 !px-6 !text-sm !rounded-xl">
                      Area Riservata
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2">
                      {/* If superadmin, show link to superadmin panel */}
                      {isSA && (
                        <Link
                          to="/superadmin"
                          className="hidden lg:block px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all border border-rose-500/20"
                      >
                        Esci
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to="/"
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Home
                  </Link>
                  {siteSettings.whatsappNumber && (
                    <a
                      href={`https://wa.me/${siteSettings.whatsappNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-neon-indigo !py-2.5 !px-6 !text-sm !rounded-xl !bg-emerald-500 !shadow-emerald-500/30"
                    >
                      Contattaci
                    </a>
                  )}
                </>
              )}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
