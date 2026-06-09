import React from 'react';
import type { ExamAnalytics } from '../types/analysis.types';
import { useTranslation } from 'react-i18next';

interface Props { analytics: ExamAnalytics | undefined; loading?: boolean; }

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between border-b border-gray-50 dark:border-[#2a2a2e] py-2 last:border-0">
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 ml-2 max-w-[160px] text-right truncate">{value}</span>
  </div>
);

export const ExamSummaryCard: React.FC<Props> = ({ analytics, loading }) => {
  const { t } = useTranslation();
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 animate-pulse bg-gray-100 dark:bg-[#2a2a2e] rounded-xl" />
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400 dark:text-gray-500">
        <span className="text-2xl">📋</span>
        <p className="text-sm">{t('analysis.noDataAvailable')}</p>
      </div>
    );
  }

  const passRateColor =
    analytics.passRate >= 70 ? 'text-emerald-600 dark:text-emerald-400'
    : analytics.passRate >= 50 ? 'text-amber-600 dark:text-amber-400'
    : 'text-red-500 dark:text-red-400';

  return (
    <div>
      <Row label={t('analysis.exam')}           value={analytics.examTitle} />
      <Row label={t('analysis.totalAttempts')}  value={String(analytics.totalAttempts)} />
      <Row label={t('analysis.uniqueStudents')} value={String(analytics.uniqueStudents)} />
      <Row label={t('analysis.classAverage')}   value={`${Math.round(analytics.averageScorePercentage)}%`} />
      <Row label={t('analysis.highestScore')}   value={`${Math.round(analytics.highestScorePercentage)}%`} />
      <Row label={t('analysis.lowestScore')}    value={`${Math.round(analytics.lowestScorePercentage)}%`} />
      <Row label={t('analysis.medianScore')}    value={`${Math.round(analytics.medianScorePercentage)}%`} />

      <div className="pt-3">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('analysis.passRate')}</span>
          <span className={`text-sm font-bold ${passRateColor}`}>{Math.round(analytics.passRate)}%</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-[#2a2a2e] rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${analytics.passRate}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
          <span>{analytics.passedCount} {t('analysis.passed')}</span>
          <span>{analytics.failedCount} {t('analysis.failed')}</span>
        </div>
      </div>
    </div>
  );
};