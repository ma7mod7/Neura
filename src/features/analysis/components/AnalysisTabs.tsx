import React from 'react';

export interface AnalysisTabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface Props {
  tabs: AnalysisTabItem[];
  active: string;
  onChange: (id: string) => void;
}

export const AnalysisTabs: React.FC<Props> = ({ tabs, active, onChange }) => (
  <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-[#1A1A1A]/80 border border-slate-200/60 dark:border-[#2a2a2e] backdrop-blur-xl">
    {tabs.map((tab) => {
      const isActive = tab.id === active;
      return (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
            isActive
              ? 'bg-[#0061EF] text-white shadow-lg shadow-[#0061EF]/25'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'
          }`}
        >
          {tab.icon}
          {tab.label}
          {!!tab.badge && (
            <span
              className={`text-[10px] font-black rounded-full px-1.5 py-0.5 min-w-[18px] text-center ${
                isActive ? 'bg-white/25 text-white' : 'bg-[#0061EF]/15 text-[#0061EF]'
              }`}
            >
              {tab.badge}
            </span>
          )}
        </button>
      );
    })}
  </div>
);