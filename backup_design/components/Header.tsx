import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { useBrand } from '../contexts/BrandContext';
import { NavLink as NavLinkType } from '../types';
import { DemoBadge } from './demo/DemoBadge';

const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const activeClass = 'bg-blue-600 text-white shadow-md';
  const inactiveClass = 'text-gray-700 hover:bg-gray-100 hover:text-gray-900';

  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? activeClass : inactiveClass}`}
    >
      {children}
    </Link>
  );
};

const Header: React.FC = () => {
  const { siteSettings } = useAppContext();
  const { brand } = useBrand();

  // Check if this is demo gallery
  const isDemo = brand?.isDemo || brand?.slug === 'demo';

  return (
    <>
      {isDemo && <DemoBadge />}
      <header className="sticky top-0 z-50">
        <div className="bg-white/30 backdrop-blur-xl border-b border-white/40 shadow-lg">
          <nav className="container-xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-3 text-lg font-semibold tracking-wide text-slate-900"
            >
              {siteSettings.logoUrl ? (
                <img
                  src={siteSettings.logoUrl}
                  alt="Site Logo"
                  className="h-10 w-auto rounded-lg shadow"
                />
              ) : (
                <span className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  CG
                </span>
              )}
              <span>{siteSettings.appName}</span>
            </Link>
            <div className="flex-1 flex flex-wrap items-center gap-3 md:justify-center">
              {siteSettings.navLinks.map((link: NavLinkType) => (
                <NavLink key={link.id} to={link.to}>
                  {link.text}
                </NavLink>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {!isDemo && (
                <>
                  <Link
                    to="/demo"
                    className="rounded-full px-4 py-2 text-sm font-semibold bg-white/90 text-slate-900 border border-white/70 shadow hover:-translate-y-0.5 transition"
                  >
                    Demo
                  </Link>
                  <Link
                    to={isDemo ? '#features' : '/superadmin'}
                    className="rounded-full px-4 py-2 text-sm font-semibold bg-slate-900 text-white shadow-lg"
                  >
                    {isDemo ? 'Esplora Catalogo' : 'SuperAdmin'}
                  </Link>
                </>
              )}
              {isDemo && (
                <>
                  {siteSettings.whatsappNumber && (
                    <a
                      href={`https://wa.me/${siteSettings.whatsappNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full px-4 py-2 text-sm font-semibold bg-emerald-500 text-white shadow-lg hover:-translate-y-0.5 transition"
                    >
                      Contattaci
                    </a>
                  )}
                  <Link
                    to="/"
                    className="rounded-full px-4 py-2 text-sm font-semibold bg-white/90 text-slate-900 border border-white/70 shadow hover:-translate-y-0.5 transition"
                  >
                    Home
                  </Link>
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
