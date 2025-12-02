import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
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
  const isDemo = brand?.isDemo || brand?.subdomain === 'demo';

  return (
    <>
      {isDemo && <DemoBadge />}
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-gray-200">
        <nav className="container-xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/"
                className="flex-shrink-0 flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                {siteSettings.logoUrl ? (
                  <img
                    src={siteSettings.logoUrl}
                    alt="Site Logo"
                    className="h-10 w-auto rounded-lg"
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-blue-600"
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
                )}
                <span className="text-xl font-bold text-gray-900">{siteSettings.appName}</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center gap-2">
                {siteSettings.navLinks.map((link: NavLinkType) => (
                  <NavLink key={link.id} to={link.to}>
                    {link.text}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
