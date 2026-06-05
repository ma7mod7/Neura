import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import type { AttemptSummary } from '../types/analysis.types';
import { useTranslation } from 'react-i18next';
interface ChartPoint { label: string; score: number; passed: boolean; }
interface Props { attempts?: AttemptSummary[]; loading?: boolean; }

export const ScoreTrendChart: React.FC<Props> = ({ attempts = [], loading }) => {
  const { t } = useTranslation();

  if (loading) return <div className="animate-pulse bg-gray-100 dark:bg-[#2a2a2e] rounded-xl h-56 w-full" />;

  const data: ChartPoint[] = [...attempts]
    .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
    .map((a, i) => ({
      label: `${t('analysis.attempt')} ${i + 1}`,
      score: (a as any).scorePercentage != null
      ? Math.round((a as any).scorePercentage)
      : a.maxScore > 0
        ? Math.round((a.score / a.maxScore) * 100)
        : 0,
      passed: a.passed,
    }));

  if (!data.length) {
    return (
      <div className="h-56 flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
        <span className="text-3xl">📊</span>
        <p className="text-sm">{t('analysis.noAttemptsFound')}</p>
      </div>
    );
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <Tooltip
            formatter={(value) => [`${value}%`, t('analysis.score')]}
            contentStyle={{ background: '#1c1c1f', border: '1px solid #2a2a2e', borderRadius: 12, fontSize: 13, color: '#e0e0e0' }}
          />
          <ReferenceLine y={60} stroke="#ef444455" strokeDasharray="4 4" label={{ value: 'Pass line', fill: '#ef4444', fontSize: 10 }} />
          <Area
            type="monotone" dataKey="score" name="Score"
            stroke="#2563eb" strokeWidth={2.5} fill="url(#scoreGrad)"
            dot={(props) => {
              const point = props.payload as ChartPoint;
              return <circle key={props.key} cx={props.cx} cy={props.cy} r={5} fill={point.passed ? '#10b981' : '#ef4444'} stroke="#fff" strokeWidth={2} />;
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />{t('analysis.passed')}</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />{t('analysis.failed')}</span>
      </div>
    </>
  );
};