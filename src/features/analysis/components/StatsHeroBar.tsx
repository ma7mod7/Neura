import React from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useTranslation } from 'react-i18next';

export interface StatItem { label: string; value: string; }

interface Props {
  title: string;
  subtitle?: string;
  stats: StatItem[];
  gradient?: string;
}

export const StatsHeroBar: React.FC<Props> = ({ title, subtitle, stats, gradient = 'bg-[#0061EF]' }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()
    || user?.userName
    || '';

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <img
          src={user?.imageUrl}
          className="w-10 h-10 rounded-full border-2 border-[#0061EF] object-cover p-0.5"
          alt="Profile"
        />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          {title}
        </h2>
      </div>

      {/* Row 2: blue banner card */}
      <div className={`rounded-[2rem] ${gradient} px-6 lg:px-12 py-12 flex flex-col lg:flex-row items-center justify-between gap-6 text-white mb-6`}>
        {/* Left: subtitle + name */}
        <div>
          {subtitle && <p className="text-blue-200 text-sm font-medium mb-1">{subtitle}</p>}
          <h1 className="text-3xl lg:text-4xl font-bold">{displayName || title}</h1>
        </div>

        {/* Right: stat pills */}
        <div className="flex flex-wrap gap-3 justify-end">
          {stats.length > 0
            ? stats.map((s) => (
                <div key={s.label} className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 min-w-[110px]">
                  <p className="text-blue-100 text-xs">{s.label}</p>
                  <p className="text-white font-bold text-lg mt-0.5">{s.value}</p>
                </div>
              ))
            : Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white/10 animate-pulse rounded-2xl px-4 py-3 min-w-[110px] h-[62px]" />
              ))
          }
        </div>
      </div>
    </>
  );
};