import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-3xl border border-white/60 dark:border-[#2a2a2e] bg-white/70 dark:bg-[#1A1A1A]/70 backdrop-blur-2xl shadow-xl shadow-black/5 dark:shadow-black/40 ${className}`}>
    {children}
  </div>
);

export function StatCard({
  icon, label, value, trend, color = '#0061EF',
}: {
  icon: React.ReactNode; label: string; value: string; trend?: string; color?: string;
}) {
  return (
    <GlassCard className="p-5 flex flex-col gap-3 hover:scale-[1.01] transition-transform duration-200">
      <div className="flex items-center justify-between">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: `${color}18` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
            <ArrowUpRight size={12} />
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
      </div>
    </GlassCard>
  );
}

export function SectionHeader({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 rounded-2xl bg-[#0061EF]/10 dark:bg-[#0061EF]/20 flex items-center justify-center">
        <span className="text-[#0061EF]">{icon}</span>
      </div>
      <h2 className="text-base font-bold text-slate-800 dark:text-white">{title}</h2>
      {badge && (
        <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0061EF]/10 text-[#0061EF] dark:bg-[#0061EF]/20 dark:text-blue-300">
          {badge}
        </span>
      )}
    </div>
  );
}