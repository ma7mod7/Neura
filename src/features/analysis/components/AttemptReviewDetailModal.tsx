import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle2, XCircle, Award, Clock, AlertTriangle, User, BookOpen, Loader2 } from 'lucide-react';
import { useAttemptReviewDetail, useApproveAttempt, useRejectAttempt } from '../hooks/useAttemptReview';
import { AttemptStatusBadge } from './AttemptStatusBadge';

interface Props {
  attemptId: number;
  onClose: () => void;
}

export const AttemptReviewDetailModal: React.FC<Props> = ({ attemptId, onClose }) => {
  const { t } = useTranslation();
  const { data: attempt, isLoading } = useAttemptReviewDetail(attemptId);
  const approveMut = useApproveAttempt();
  const rejectMut = useRejectAttempt();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = () =>
    approveMut.mutate(
      { attemptId, examId: attempt?.examId != null ? String(attempt.examId) : '' },
      { onSuccess: onClose }
    );
  const handleReject = () =>
    rejectMut.mutate(
      {
        attemptId,
        reason: rejectReason.trim() || undefined,
        examId: attempt?.examId != null ? String(attempt.examId) : ''
      },
      { onSuccess: onClose }
    );

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl border border-white/60 dark:border-[#2a2a2e] bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-2xl shadow-2xl flex flex-col">

        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-[#2a2a2e] shrink-0">
          <div className="min-w-0">
            <h3 className="font-black text-lg text-slate-900 dark:text-white truncate">
              {attempt ? attempt.examTitle : t('attemptReview.loadingAttempt')}
            </h3>
            {attempt && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                <BookOpen size={12} /> {attempt.courseTitle}
              </div>
            )}
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-[#2a2a2e] transition-colors shrink-0">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {isLoading || !attempt ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-[#0061EF]" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <AttemptStatusBadge status={attempt.status} />
                <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <User size={12} /> {attempt.studentName} ({attempt.studentEmail})
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Award size={12} /> {Math.round(attempt.scorePercentage)}% ({attempt.score}/{attempt.totalPoints})
                </span>
                {attempt.durationInSeconds != null && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Clock size={12} /> {Math.round(attempt.durationInSeconds / 60)} {t('examReview.minutes')}
                  </span>
                )}
                {attempt.violationCount > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-red-500 font-semibold">
                    <AlertTriangle size={12} /> {attempt.violationCount} {t('attemptReview.violations')}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {attempt.answers.map((a, idx) => (
                  <div key={a.questionId} className="rounded-2xl border border-slate-100 dark:border-[#2a2a2e] p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p className="font-semibold text-sm text-slate-800 dark:text-white">
                        <span className="text-[#0061EF] font-bold">{idx + 1}.</span> {a.questionText}
                      </p>
                      <span className="text-[11px] font-bold text-slate-400 shrink-0">{a.earnedPoints}/{a.points} {t('examReview.pts')}</span>
                    </div>
                    <div className="space-y-1.5">
                      {a.options.map((opt) => {
                        const isCorrectSelected = opt.isSelected && opt.isCorrect;
                        const isWrongSelected = opt.isSelected && !opt.isCorrect;
                        return (
                          <div
                            key={opt.id}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
                              isCorrectSelected
                                ? 'bg-emerald-50 dark:bg-emerald-900/15 text-emerald-700 dark:text-emerald-400 font-semibold'
                                : isWrongSelected
                                ? 'bg-red-50 dark:bg-red-900/15 text-red-600 dark:text-red-400 font-semibold'
                                : opt.isCorrect
                                ? 'bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-500'
                                : 'bg-slate-50 dark:bg-[#2a2a2e]/60 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {opt.isSelected ? <CheckCircle2 size={13} /> : <span className="w-[13px]" />}
                            {opt.text}
                            {opt.isCorrect && <span className="ml-auto text-[10px] uppercase font-bold opacity-70">{t('attemptReview.correctAnswer')}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {attempt?.status === 'UnderReview' && (
          <div className="border-t border-slate-100 dark:border-[#2a2a2e] p-5 shrink-0">
            {!showRejectForm ? (
              <div className="flex items-center gap-3">
                <button onClick={handleApprove} disabled={approveMut.isPending} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-colors disabled:opacity-60">
                  {approveMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {t('attemptReview.approveAndRelease')}
                </button>
                <button onClick={() => setShowRejectForm(true)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold text-sm transition-colors">
                  <XCircle size={16} />
                  {t('attemptReview.rejectAndFail')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('attemptReview.rejectWarning')}</p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={t('attemptReview.rejectionPlaceholder')}
                  rows={3}
                  className="w-full px-4 py-3 text-sm rounded-2xl bg-slate-50 dark:bg-[#0e0e10] text-slate-800 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-[#2a2a2e] focus:outline-none focus:border-red-400 transition-colors resize-none"
                />
                <div className="flex items-center gap-3">
                  <button onClick={() => { setShowRejectForm(false); setRejectReason(''); }} className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-[#2a2a2e] text-slate-500 font-bold text-sm hover:bg-slate-50 dark:hover:bg-[#2a2a2e] transition-colors">
                    {t('examReview.cancel')}
                  </button>
                  <button onClick={handleReject} disabled={rejectMut.isPending} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors disabled:opacity-50">
                    {rejectMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                    {t('attemptReview.confirmRejectAndFail')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};