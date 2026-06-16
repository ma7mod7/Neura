import React from 'react';
import type { ExamAnalytics } from '../types/analysis.types';
import { useTranslation } from 'react-i18next';

interface StudentExamAnalytics {
  examId: number;
  examTitle: string | null;
  studentScorePercentage: number | null;
  totalStudentAttempts: number;
  hasCompletedAttempt: boolean;
  classAveragePercentage: number;
  classHighestPercentage: number;
  classMedianPercentage: number;
  totalClassAttempts: number;
  studentPercentile: number | null;
}

interface SummaryProps {
  analytics: ExamAnalytics | StudentExamAnalytics | undefined;
  loading?: boolean;
  mode?: 'instructor' | 'student';
}

const SummaryRow: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-[#2a2a2e] last:border-0">
    <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
    <span className={`text-sm font-bold max-w-[160px] text-right truncate ${
      accent ? 'text-[#0061EF] dark:text-blue-400' : 'text-slate-800 dark:text-white'
    }`}>{value}</span>
  </div>
);

function isStudentAnalytics(a: any): a is StudentExamAnalytics {
  return 'classAveragePercentage' in a;
}

export const ExamSummaryCard: React.FC<SummaryProps> = ({ analytics, loading, mode = 'instructor' }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
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

  //  Student mode 
  if (mode === 'student' && isStudentAnalytics(analytics)) {
    const avg = analytics.classAveragePercentage;
    const avgColor = avg >= 70 ? '#059669' : avg >= 50 ? '#d97706' : '#ef4444';

    return (
      <div>
        <SummaryRow label={t('analysis.exam')}             value={analytics.examTitle ?? '—'} accent />
        <SummaryRow label={t('analysis.myScore')}          value={analytics.studentScorePercentage != null ? `${Math.round(analytics.studentScorePercentage)}%` : '—'} />
        <SummaryRow label={t('analysis.myAttempts')}       value={String(analytics.totalStudentAttempts)} />
        <SummaryRow label={t('analysis.classAverage')}     value={`${Math.round(analytics.classAveragePercentage)}%`} />
        <SummaryRow label={t('analysis.classHighest')}     value={`${Math.round(analytics.classHighestPercentage)}%`} />
        <SummaryRow label={t('analysis.classMedian')}      value={`${Math.round(analytics.classMedianPercentage)}%`} />
        {analytics.studentPercentile != null && (
          <SummaryRow label={t('analysis.yourPercentile')} value={`Top ${Math.round(100 - analytics.studentPercentile)}%`} />
        )}

        <div className="pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('analysis.classAverage')}</span>
            <span className="text-sm font-black" style={{ color: avgColor }}>{Math.round(avg)}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 dark:bg-[#2a2a2e] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${avg}%`, background: avgColor }} />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1.5">
            <span>{analytics.totalClassAttempts} {t('analysis.totalAttempts')}</span>
            <span>{analytics.hasCompletedAttempt ? '✓ ' + t('analysis.completed') : t('analysis.notCompleted')}</span>
          </div>
        </div>
      </div>
    );
  }

  //  Instructor mode 
  const inst = analytics as ExamAnalytics;
  const passRateColor = inst.passRate >= 70 ? '#059669' : inst.passRate >= 50 ? '#d97706' : '#ef4444';

  return (
    <div>
      <SummaryRow label={t('analysis.exam')}           value={inst.examTitle ?? '—'} accent />
      <SummaryRow label={t('analysis.totalAttempts')}  value={String(inst.totalAttempts)} />
      <SummaryRow label={t('analysis.uniqueStudents')} value={String(inst.uniqueStudents)} />
      <SummaryRow label={t('analysis.classAverage')}   value={`${Math.round(inst.averageScorePercentage)}%`} />
      <SummaryRow label={t('analysis.highestScore')}   value={`${Math.round(inst.highestScorePercentage)}%`} />
      <SummaryRow label={t('analysis.lowestScore')}    value={`${Math.round(inst.lowestScorePercentage)}%`} />
      <SummaryRow label={t('analysis.medianScore')}    value={`${Math.round(inst.medianScorePercentage)}%`} />
      <div className="pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('analysis.passRate')}</span>
          <span className="text-sm font-black" style={{ color: passRateColor }}>{Math.round(inst.passRate)}%</span>
        </div>
        <div className="h-2.5 bg-slate-100 dark:bg-[#2a2a2e] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${inst.passRate}%`, background: passRateColor }} />
        </div>
        <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1.5">
          <span className="font-medium text-emerald-600 dark:text-emerald-500">{inst.passedCount} {t('analysis.passed')}</span>
          <span className="font-medium text-red-500 dark:text-red-400">{inst.failedCount} {t('analysis.failed')}</span>
        </div>
      </div>
    </div>
  );
};