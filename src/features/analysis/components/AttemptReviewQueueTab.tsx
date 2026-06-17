import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle2, XCircle, Inbox, BookOpen } from 'lucide-react';
import { GlassCard, SectionHeader } from './AnalysisUI';
import { useInstructorExamList } from '../hooks/useExamList';
import { useExamViolations, useResolveViolation, useFlagViolation } from '../hooks/useViolationReview';
import { ExamPicker } from './ExamPicker';

export const AttemptReviewQueueTab: React.FC = () => {
  const { t } = useTranslation();
  const { exams, isLoading: examsLoading } = useInstructorExamList();
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  const { data: violations, isLoading: violationsLoading } = useExamViolations(selectedExamId);
  const resolveMut = useResolveViolation(selectedExamId ?? '');
  const flagMut = useFlagViolation(selectedExamId ?? '');

  const items = Array.isArray(violations) ? violations : (violations as any)?.violations ?? [];

  return (
    <div className="space-y-6">
      {/* Exam Picker */}
      <GlassCard className="p-5 overflow-visible">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-7 h-7 rounded-xl bg-[#0061EF]/10 flex items-center justify-center">
            <BookOpen size={13} className="text-[#0061EF]" />
          </div>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {t('analysis.selectExamLabel')}
          </span>
        </div>
        <ExamPicker
          exams={exams}
          selected={selectedExamId}
          onChange={setSelectedExamId}
          loading={examsLoading}
        />
      </GlassCard>

      {/* Violations List */}
      <GlassCard className="p-6">
        <SectionHeader
          icon={<AlertTriangle size={15} />}
          title={t('examReview.cheatingViolationsPending')}
          badge={!violationsLoading ? `${items.length} ${t('examReview.pending')}` : undefined}
        />

        {!selectedExamId ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-[#222] flex items-center justify-center text-2xl">📋</div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t('examReview.selectExamToSeeViolations')}</p>
          </div>
        ) : violationsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-3xl bg-slate-100 dark:bg-[#2a2a2e] animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-900/15 flex items-center justify-center">
              <Inbox size={26} className="text-emerald-500" />
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-bold">{t('examReview.noViolationsDetected')}</p>
            <p className="text-sm text-slate-400">{t('examReview.allStudentsBehavedWell')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((v: any) => (
              <div key={v.attemptId ?? v.id}
                className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 dark:border-[#2a2a2e] bg-white dark:bg-[#1A1A1A]">
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 dark:text-white text-sm truncate">
                    {v.studentName ?? v.userName ?? `Attempt #${v.attemptId}`}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-red-500">
                      <AlertTriangle size={11} />
                      {v.violationCount ?? v.totalViolations ?? 1} {t('examReview.violations')}
                    </span>
                    <span>{v.submittedAt ? new Date(v.submittedAt).toLocaleDateString() : ''}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => resolveMut.mutate({ attemptId: v.attemptId ?? v.id, newScore: v.score ?? 0 })}
                    disabled={resolveMut.isPending}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors disabled:opacity-60"
                  >
                    <CheckCircle2 size={13} />
                    {t('examReview.resolvePass')}
                  </button>
                  <button
                    onClick={() => flagMut.mutate(v.attemptId ?? v.id)}
                    disabled={flagMut.isPending}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 text-xs font-bold transition-colors disabled:opacity-60"
                  >
                    <XCircle size={13} />
                    {t('examReview.flagFail')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
};