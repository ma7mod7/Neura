import React from 'react';

export function MeshBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[#F8FAFC] dark:bg-[#0e0e10]" />
      <div className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full opacity-25 dark:opacity-10" style={{ background: 'radial-gradient(circle, #0061EF 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <div className="absolute top-1/3 -right-64 w-[600px] h-[600px] rounded-full opacity-15 dark:opacity-8" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(100px)' }} />
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full opacity-10 dark:opacity-6" style={{ background: 'radial-gradient(circle, #0061EF 0%, transparent 70%)', filter: 'blur(90px)' }} />
      <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]" style={{ backgroundImage: `linear-gradient(rgba(0,97,239,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,97,239,0.5) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
    </div>
  );
}

export const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-3xl border border-white/60 dark:border-[#2a2a2e] bg-white/70 dark:bg-[#1A1A1A]/70 backdrop-blur-2xl shadow-xl shadow-black/5 dark:shadow-black/40 ${className}`}>
    {children}
  </div>
);

export function SectionHeader({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 rounded-2xl bg-[#0061EF]/10 dark:bg-[#0061EF]/20 flex items-center justify-center">
        <span className="text-[#0061EF]">{icon}</span>
      </div>
      <h2 className="text-base font-bold text-slate-800 dark:text-white">{title}</h2>
      {badge && <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0061EF]/10 text-[#0061EF] dark:bg-[#0061EF]/20 dark:text-blue-300">{badge}</span>}
    </div>
  );
}