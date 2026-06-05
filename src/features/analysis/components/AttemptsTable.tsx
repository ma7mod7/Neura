import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AttemptSummary } from '../types/analysis.types';
import { useTranslation } from 'react-i18next';
interface Props {
  attempts: AttemptSummary[];
  loading?: boolean;
  showStudent?: boolean;
  examId: string | null;
}

type Filter = 'all' | 'passed' | 'failed';

const pctColor = (pct: number) =>
  pct >= 75 ? 'text-emerald-600 dark:text-emerald-400'
  : pct >= 55 ? 'text-amber-600 dark:text-amber-400'
  : 'text-red-500 dark:text-red-400';

export const AttemptsTable: React.FC<Props> = ({ attempts = [], loading, showStudent = true, examId }) => {
 const { t } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse bg-gray-100 dark:bg-[#2a2a2e] rounded-xl" />
        ))}
      </div>
    );
  }

  const filtered = attempts.filter((a) => {
    const matchFilter = filter === 'all' || (filter === 'passed' ? a.passed : !a.passed);
    const matchSearch = !search || a.studentName?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#2a2a2e] rounded-xl p-1 w-fit">
          {(['all', 'passed', 'failed'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-white dark:bg-[#1c1c1f] text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {f === 'all'
                ? `${t('analysis.all')} (${attempts.length})`
                : f === 'passed'
                  ? `${t('analysis.passed')} (${attempts.filter(a => a.passed).length})`
                  : `${t('analysis.failed')} (${attempts.filter(a => !a.passed).length})`}            
               </button>
          ))}
        </div>

        {showStudent && (
          <input
            type="text"
            placeholder="Search student name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 dark:border-[#2a2a2e] rounded-xl px-3 py-2 text-sm
                       bg-white dark:bg-[#0e0e10] text-gray-800 dark:text-gray-200
                       placeholder:text-gray-400 dark:placeholder:text-gray-600
                       focus:outline-none focus:ring-2 focus:ring-blue-300 w-52"
          />
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="py-10 flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
          <span className="text-3xl">🔍</span>
          <p className="text-sm">{t('analysis.noAttemptsMatchFilter')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2a2a2e]">
                {showStudent && <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 pb-3 pr-4">{t('analysis.student')}</th>}
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 pb-3 pr-4">{t('analysis.date')}</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 pb-3 pr-4">{t('analysis.score')}</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 pb-3 pr-4">{t('analysis.time')}</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 pb-3 pr-4">{t('analysis.status')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const pct = a.scorePercentage != null
                    ? Math.round(a.scorePercentage)
                    : a.maxScore > 0
                      ? Math.round((a.score / a.maxScore) * 100)
                      : 0;
                return (
                  <tr key={a.attemptId} className="border-b border-gray-50 dark:border-[#2a2a2e] hover:bg-gray-50/60 dark:hover:bg-[#2a2a2e]/40 transition-colors">
                    {showStudent && (
                      <td className="py-3 pr-4 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{a.studentName}</td>
                    )}
                    <td className="py-3 pr-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(a.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`font-bold ${pctColor(pct)}`}>{pct}%</span>
                    </td>
                    <td className="py-3 pr-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {a.timeTakenMinutes
                        ? `${a.timeTakenMinutes}m`
                        : (a as any).timeTakenInSeconds
                          ? `${Math.round((a as any).timeTakenInSeconds / 60)}m`
                          : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        a.passed
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                          : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30'
                      }`}>
                        {a.passed ? t('analysis.passed') : t('analysis.failed')}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => navigate(`/exam/${examId}/results/${a.attemptId}`)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium whitespace-nowrap"
                      >
                        {t('analysis.review')} →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};