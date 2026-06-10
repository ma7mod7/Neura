import React from 'react';
import type { ExamAnalytics } from '../types/analysis.types';
import { useTranslation } from 'react-i18next';

interface SummaryProps { analytics: ExamAnalytics | undefined; loading?: boolean; }

const SummaryRow: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-[#2a2a2e] last:border-0">
    <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
    <span className={`text-sm font-bold max-w-[160px] text-right truncate ${
      accent ? 'text-[#0061EF] dark:text-blue-400' : 'text-slate-800 dark:text-white'
    }`}>{value}</span>
  </div>
);

export const ExamSummaryCard: React.FC<SummaryProps> = ({ analytics, loading }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-9 animate-pulse bg-slate-100 dark:bg-[#2a2a2e] rounded-xl" />
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400 dark:text-slate-500">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#222] flex items-center justify-center text-xl">📋</div>
        <p className="text-sm">{t('analysis.noDataAvailable')}</p>
      </div>
    );
  }

  const passRateColor =
    analytics.passRate >= 70 ? '#059669'
    : analytics.passRate >= 50 ? '#d97706'
    : '#ef4444';

  return (
    <div>
      <SummaryRow label={t('analysis.exam')}           value={analytics.examTitle} accent />
      <SummaryRow label={t('analysis.totalAttempts')}  value={String(analytics.totalAttempts)} />
      <SummaryRow label={t('analysis.uniqueStudents')} value={String(analytics.uniqueStudents)} />
      <SummaryRow label={t('analysis.classAverage')}   value={`${Math.round(analytics.averageScorePercentage)}%`} />
      <SummaryRow label={t('analysis.highestScore')}   value={`${Math.round(analytics.highestScorePercentage)}%`} />
      <SummaryRow label={t('analysis.lowestScore')}    value={`${Math.round(analytics.lowestScorePercentage)}%`} />
      <SummaryRow label={t('analysis.medianScore')}    value={`${Math.round(analytics.medianScorePercentage)}%`} />

      {/* Pass rate bar */}
      <div className="pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('analysis.passRate')}</span>
          <span className="text-sm font-black" style={{ color: passRateColor }}>
            {Math.round(analytics.passRate)}%
          </span>
        </div>
        <div className="h-2.5 bg-slate-100 dark:bg-[#2a2a2e] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${analytics.passRate}%`, background: passRateColor }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1.5">
          <span className="font-medium text-emerald-600 dark:text-emerald-500">{analytics.passedCount} {t('analysis.passed')}</span>
          <span className="font-medium text-red-500 dark:text-red-400">{analytics.failedCount} {t('analysis.failed')}</span>
        </div>
      </div>
    </div>
  );
};