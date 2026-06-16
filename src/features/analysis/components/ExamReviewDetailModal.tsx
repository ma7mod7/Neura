import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle2, XCircle, Award, Clock, BookOpen, User, Loader2 } from 'lucide-react';
import { useExamReviewDetail, useApproveExam, useRejectExam } from '../hooks/useExamReview';
import { ExamStatusBadge } from './ExamStatusBadge';

interface Props {
  examId: number;
  onClose: () => void;
}

export const ExamReviewDetailModal: React.FC<Props> = ({ examId, onClose }) => {
  const { t } = useTranslation();
  const { data: exam, isLoading } = useExamReviewDetail(examId);
  const approveMut = useApproveExam();
  const rejectMut  = useRejectExam();

  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = () => {
    approveMut.mutate(examId, { onSuccess: onClose });
  };

  const handleReject = () => {
    if (rejectReason.trim().length < 5) return;
    rejectMut.mutate({ examId, reason: rejectReason.trim() }, { onSuccess: onClose });
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl border border-white/60 dark:border-[#2a2a2e] bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-2xl shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-[#2a2a2e] shrink-0">
          <div className="min-w-0">
            <h3 className="font-black text-lg text-slate-900 dark:text-white truncate">
              {exam?.examTitle ?? t('examReview.loadingExam')}
            </h3>
            {exam && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                <BookOpen size={12} />
                {exam.courseTitle}
              </div>
            )}
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-[#2a2a2e] transition-colors shrink-0">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {isLoading || !exam ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-[#0061EF]" />
            </div>
          ) : (
            <>
              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3">
                <ExamStatusBadge status={exam.status} />
                <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <User size={12} /> {exam.submittedByName} · {exam.submittedByRole}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Award size={12} /> {exam.questionCount} {t('examReview.questions')} · {exam.totalPoints} {t('examReview.points')}
                </span>
                {exam.durationMinutes != null && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Clock size={12} /> {exam.durationMinutes} {t('examReview.minutes')}
                  </span>
                )}
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {exam.questions.map((q, idx) => (
                  <div key={q.id} className="rounded-2xl border border-slate-100 dark:border-[#2a2a2e] p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p className="font-semibold text-sm text-slate-800 dark:text-white">
                        <span className="text-[#0061EF] font-bold">{idx + 1}.</span> {q.text}
                      </p>
                      <span className="text-[11px] font-bold text-slate-400 shrink-0">{q.points} {t('examReview.pts')}</span>
                    </div>
                    <div className="space-y-1.5">
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
                            opt.isCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-900/15 text-emerald-700 dark:text-emerald-400 font-semibold'
                              : 'bg-slate-50 dark:bg-[#2a2a2e]/60 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {opt.isCorrect ? <CheckCircle2 size={13} /> : <span className="w-[13px]" />}
                          {opt.text}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        {exam?.status === 'PendingReview' && (
          <div className="border-t border-slate-100 dark:border-[#2a2a2e] p-5 shrink-0">
            {!showRejectForm ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleApprove}
                  disabled={approveMut.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-colors disabled:opacity-60"
                >
                  {approveMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {t('examReview.approve')}
                </button>
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold text-sm transition-colors"
                >
                  <XCircle size={16} />
                  {t('examReview.reject')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={t('examReview.rejectionPlaceholder')}
                  rows={3}
                  className="w-full px-4 py-3 text-sm rounded-2xl bg-slate-50 dark:bg-[#0e0e10] text-slate-800 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-[#2a2a2e] focus:outline-none focus:border-red-400 transition-colors resize-none"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setShowRejectForm(false); setRejectReason(''); }}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-[#2a2a2e] text-slate-500 font-bold text-sm hover:bg-slate-50 dark:hover:bg-[#2a2a2e] transition-colors"
                  >
                    {t('examReview.cancel')}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={rejectMut.isPending || rejectReason.trim().length < 5}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors disabled:opacity-50"
                  >
                    {rejectMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                    {t('examReview.confirmReject')}
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