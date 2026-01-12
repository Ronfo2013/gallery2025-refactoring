import { APP_THEME, cn, getButtonClasses, getPrimaryGradient } from '@/lib/appLayout';
import { Bell, Command, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { branding, layout } = APP_THEME;
  const isGlass = layout.navbar.style === 'glass';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        layout.navbar.height,
        scrolled || !isGlass
          ? 'bg-night-950/80 backdrop-blur-md border-white/5 shadow-lg'
          : 'bg-transparent border-transparent'
      )}
    >
      <div
        className={cn(
          'h-full mx-auto flex items-center justify-between',
          layout.maxWidth,
          layout.pagePadding
        )}
      >
        {/* Logo Area */}
        <Link to="/" className="flex items-center gap-2 group">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110',
              getPrimaryGradient()
            )}
          >
            <Command className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">
            {branding.logoText}
          </span>
        </Link>

        {/* Desktop Nav - Placeholder for your menu items */}
        <nav className="hidden md:flex items-center gap-6">
          {['Dashboard', 'Gallery', 'Analisi', 'Impostazioni'].map((item) => (
            <Link
              key={item}
              to={`/${item.toLowerCase()}`}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <Link to="/login" className={cn('px-4 py-1.5 text-sm', getButtonClasses('primary'))}>
            Accedi
          </Link>
        </div>
      </div>
    </header>
  );
};

const Footer = () => {
  const { branding, layout } = APP_THEME;

  return (
    <footer className="border-t border-white/5 bg-night-950">
      <div
        className={cn(
          'py-12 grid grid-cols-1 md:grid-cols-4 gap-8',
          layout.maxWidth,
          layout.pagePadding
        )}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-6 h-6 rounded flex items-center justify-center',
                getPrimaryGradient()
              )}
            >
              <Command className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-white">{branding.logoText}</span>
          </div>
          <p className="text-sm text-gray-500">
            Il sistema definitivo per la gestione delle tue app. Standardizzato, scalabile,
            bellissimo.
          </p>
        </div>

        {/* Example Footer Columns */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <h4 className="font-semibold text-white">Colonna {i}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link to="#" className="hover:text-primary-400 transition-colors">
                  Link Utile
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary-400 transition-colors">
                  Risorse
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary-400 transition-colors">
                  Documentazione
                </Link>
              </li>
            </ul>
          </div>
        ))}
      </div>
      <div
        className={cn(
          'py-6 border-t border-white/5 text-center text-xs text-gray-600',
          layout.maxWidth,
          'mx-auto'
        )}
      >
        © {new Date().getFullYear()} {branding.name}. Tutti i diritti riservati.
      </div>
    </footer>
  );
};

export const Shell = () => {
  const { branding, layout } = APP_THEME;

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col font-sans selection:bg-indigo-500/30',
        branding.colors.darkBase
      )}
    >
      {/* Background Ambience e.g. Mesh Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className={cn(
            'absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 animate-pulse-slow',
            `bg-${branding.colors.primary}-600`
          )}
        />
        <div
          className={cn(
            'absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 animate-pulse-slow',
            `bg-${branding.colors.accent}-600`
          )}
        />
      </div>

      <Navbar />

      <main
        className={cn(
          'relative z-10 flex-grow w-full mx-auto pt-24 pb-12', // pt-24 to account for fixed header
          layout.maxWidth,
          layout.pagePadding
        )}
      >
        <Outlet />
      </main>

      {layout.footer.visible && <Footer />}
    </div>
  );
};
