import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AttemptSummary } from '../types/analysis.types';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, ChevronRight, Search } from 'lucide-react';

interface Props {
  attempts: AttemptSummary[];
  loading?: boolean;
  showStudent?: boolean;
  examId: string | null;
}

type Filter = 'all' | 'passed' | 'failed';

const pctColor = (pct: number) =>
  pct >= 75 ? 'text-emerald-600 dark:text-emerald-400'
  : pct >= 55 ? 'text-amber-500 dark:text-amber-400'
  : 'text-red-500 dark:text-red-400';

const pctBg = (pct: number) =>
  pct >= 75 ? 'bg-emerald-500'
  : pct >= 55 ? 'bg-amber-500'
  : 'bg-red-500';

export const AttemptsTable: React.FC<Props> = ({ attempts = [], loading, showStudent = true, examId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-100 dark:bg-[#2a2a2e]" />
        ))}
      </div>
    );
  }

  const filtered = attempts.filter((a) => {
    const matchFilter = filter === 'all' || (filter === 'passed' ? a.passed : !a.passed);
    const matchSearch = !search || a.studentName?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const passCount = attempts.filter(a => a.passed).length;
  const failCount = attempts.filter(a => !a.passed).length;

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#222] rounded-2xl p-1 w-fit">
          {(['all', 'passed', 'failed'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all duration-200 ${
                filter === f
                  ? 'bg-white dark:bg-[#1A1A1A] text-[#0061EF] shadow-sm border border-slate-100 dark:border-[#2a2a2e]'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {f === 'all'
                ? `${t('analysis.all')} (${attempts.length})`
                : f === 'passed'
                  ? `✓ ${t('analysis.passed')} (${passCount})`
                  : `✗ ${t('analysis.failed')} (${failCount})`}
            </button>
          ))}
        </div>

        {/* Search */}
        {showStudent && (
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('analysis.SearchStudentName')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 text-sm rounded-2xl border border-slate-200 dark:border-[#2a2a2e]
                         bg-white/80 dark:bg-[#111]/80 backdrop-blur-sm
                         text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600
                         focus:outline-none focus:ring-2 focus:ring-[#0061EF]/30 w-52 transition-all"
            />
          </div>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="py-12 flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-[#222] flex items-center justify-center text-2xl">🔍</div>
          <p className="text-sm font-medium">{t('analysis.noAttemptsMatchFilter')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {showStudent && (
                  <th className="text-left text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pb-3 pr-4 pl-1">
                    {t('analysis.student')}
                  </th>
                )}
                <th className="text-left text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pb-3 pr-4">{t('analysis.date')}</th>
                <th className="text-left text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pb-3 pr-4">{t('analysis.score')}</th>
                <th className="text-left text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pb-3 pr-4">{t('analysis.time')}</th>
                <th className="text-left text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pb-3 pr-4">{t('analysis.status')}</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2a2a2e]">
              {filtered.map((a) => {
                const pct = Math.round(a.scorePercentage ?? 0);
                return (
                  <tr key={a.attemptId}
                    className="group hover:bg-[#0061EF]/[0.03] dark:hover:bg-[#0061EF]/[0.06] transition-colors rounded-2xl">
                    {showStudent && (
                      <td className="py-4 pr-4 pl-1 font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                        {a.studentName}
                      </td>
                    )}
                    <td className="py-4 pr-4 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                      {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-base ${pctColor(pct)}`}>{pct}%</span>
                        <div className="w-14 h-1.5 rounded-full bg-slate-100 dark:bg-[#2a2a2e] overflow-hidden">
                          <div className={`h-full rounded-full ${pctBg(pct)} transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                      {a.durationInSeconds ? `${Math.round(a.durationInSeconds / 60)}m` : '—'}
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        a.passed
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                        {a.passed
                          ? <CheckCircle2 size={11} />
                          : <XCircle size={11} />
                        }
                        {a.passed ? t('analysis.passed') : t('analysis.failed')}
                      </span>
                    </td>
                    <td className="py-4">
                      <button
                        onClick={() => navigate(`/exam/${examId}/results/${a.attemptId}`)}
                        className="flex items-center gap-1 text-xs text-[#0061EF] dark:text-blue-400 font-bold hover:gap-2 transition-all whitespace-nowrap"
                      >
                        {t('analysis.review')}
                        <ChevronRight size={13} />
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