import React from 'react';

interface GlassAuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const GlassAuthLayout: React.FC<GlassAuthLayoutProps> = ({ title, subtitle, children }) => (
  <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center relative overflow-hidden">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-32 -right-16 w-72 h-72 rounded-full bg-fuchsia-500/40 blur-3xl" />
      <div className="absolute top-24 -left-16 w-64 h-64 rounded-full bg-sky-500/30 blur-3xl" />
      <div className="absolute bottom-[-5rem] right-1/4 w-64 h-64 rounded-full bg-emerald-400/25 blur-3xl" />
    </div>
    <div className="relative z-10 w-full max-w-3xl px-4 lg:px-8 mx-auto">
      <div className="rounded-3xl border border-white/30 bg-white/5 backdrop-blur-3xl shadow-[0_40px_120px_rgba(15,23,42,0.8)] p-6 md:p-10">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] font-semibold text-white/70 mb-4">
          <div className="flex items-center gap-2">
            <span>clubgallery.com</span>
            <span className="h-1 w-1 rounded-full bg-white/70" />
            <span>superadmin</span>
          </div>
          <span className="flex items-center gap-1">
            Sei in: <strong className="text-white">{title}</strong>
          </span>
        </div>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className="text-sm text-slate-200">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  </div>
);

export default GlassAuthLayout;
