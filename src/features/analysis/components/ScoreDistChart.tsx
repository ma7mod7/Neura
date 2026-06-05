import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ScoreDistributionItem } from '../types/analysis.types';

const COLORS   = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#2563eb'];
const BG_TINTS = ['#fef2f2', '#fff7ed', '#fffbeb', '#f0fdf4', '#eff6ff'];
const DARK_TINTS = ['#7f1d1d', '#7c2d12', '#78350f', '#14532d', '#1e3a5f'];

interface Props { data: ScoreDistributionItem[]; loading?: boolean; }

export const ScoreDistChart: React.FC<Props> = ({ data, loading }) => {
  if (loading) return <div className="animate-pulse bg-gray-100 dark:bg-[#2a2a2e] rounded-xl h-52 w-full" />;

  if (!data.length) {
    return (
      <div className="h-52 flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
        <span className="text-3xl">📉</span>
        <p className="text-sm">{t('analysis.noDistributionData')}</p>
      </div>
    );
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <Tooltip
            formatter={(value) => [`${value} ${t('analysis.students')}`, t('analysis.count')]}
            contentStyle={{ background: 'var(--tooltip-bg, #fff)', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 13 }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {data.map((d, i) => (
          <span key={d.range} className="text-xs px-2.5 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: BG_TINTS[i % BG_TINTS.length], color: COLORS[i % COLORS.length] }}>
            {d.range}: {d.count}
          </span>
        ))}
      </div>
    </>
  );
};