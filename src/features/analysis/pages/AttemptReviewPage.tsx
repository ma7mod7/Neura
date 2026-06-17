import  { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../../../shared/api/axiosInstance';
import { publishExamGrades } from '../api/analysisApi';
import { useTranslation } from 'react-i18next';

export default function AttemptReviewPage() {
  const { t } = useTranslation();
  const { examId, attemptId } = useParams<{ examId: string; attemptId: string }>();
  const navigate = useNavigate();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason]     = useState('');
  const [decided, setDecided]               = useState<'approved' | 'flagged' | null>(null);

  const { data: attempt, isLoading } = useQuery({
    queryKey: ['attemptReviewDetail', attemptId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/exams/${examId}/analytics/attempts/${attemptId}`);
      return res.data;
    },
    enabled: !!examId && !!attemptId,
  });

const alreadyDecided = attempt?.areGradesPublished === true;

  const { data: violationsData } = useQuery({
    queryKey: ['examViolations', examId],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(`/api/exams/${examId}/analytics/violations`);
        return Array.isArray(res.data) ? res.data : res.data?.violations ?? [];
      } catch {
        return [];
      }
    },
    enabled: !!examId,
  });

  const goToNextAttempt = () => {
    const violations = violationsData ?? [];
    const nextPending = violations.find(
      (v: any) => String(v.attemptId) !== String(attemptId)
    );
    if (nextPending) {
      navigate(`/exam/${examId}/results/${nextPending.attemptId}`, { replace: true });
    } else {
      navigate(-1);
    }
  };

  const resolveMut = useMutation({
    mutationFn: () => axiosInstance.put(
      `/api/exams/${examId}/analytics/attempts/${attemptId}/resolve-violation`,
      { newScore: attempt?.scorePercentage ?? 0, notes: null }
    ),
    onSuccess: () => {
      setDecided('approved');
      setTimeout(() => goToNextAttempt(), 1500);
    },
  });

 const publishMut = useMutation({
  mutationFn: () => publishExamGrades(examId!),
  onSuccess: () => {
    setTimeout(() => navigate(-1), 2000);
  },
});

  const flagMut = useMutation({
    mutationFn: () => axiosInstance.put(
      `/api/exams/${examId}/analytics/attempts/${attemptId}/flag-violation`,
      { reason: rejectReason.trim() || null }
    ),
    onSuccess: () => {
      setDecided('flagged');
      setTimeout(() => goToNextAttempt(), 1500);
    },
  });

  const pct           = Math.round(attempt?.scorePercentage ?? 0);
  const circumference = 2 * Math.PI * 28;
  const offset        = circumference - (circumference * pct) / 100;
  const ringColor     = pct >= 70 ? '#22d3a0' : pct >= 50 ? '#f5c518' : '#ef4444';

  // ── Already decided screen ──
  if (!isLoading && alreadyDecided) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0b0b0f]">
        <div className="sticky top-0 z-50 bg-white dark:bg-[#111118] border-b border-slate-200 dark:border-[#2a2a38] px-6 h-[52px] flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-slate-500 dark:text-[#7a7a9a] hover:text-slate-800 dark:hover:text-[#e8e8f0] text-sm font-semibold hover:bg-slate-100 dark:hover:bg-[#1e1e28] px-3 py-1.5 rounded-lg transition-all"
          >
            {t('examReview.back')}
          </button>
          <div className="w-px h-5 bg-slate-200 dark:bg-[#2a2a38]" />
          <span className="text-sm font-semibold">{t('examReview.attemptReview')}</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl border border-slate-200 dark:border-[#2a2a2e] p-10 max-w-md w-full text-center space-y-4">
            <div className="text-4xl">{attempt.passed ? '✓' : '✕'}</div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">
             {t('examReview.decisionAlreadyMade')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
             {attempt.passed ? t('examReview.alreadyApproved') : t('examReview.alreadyFlagged')}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-2 w-full py-3 rounded-2xl bg-[#0061EF] hover:bg-[#0052cc] text-white font-bold text-sm transition-colors"
            >
              {t('examReview.backToList')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0b0b0f] text-slate-800 dark:text-[#e8e8f0]">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-50 bg-white dark:bg-[#111118] border-b border-slate-200 dark:border-[#2a2a38] px-6 h-[52px] flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-500 dark:text-[#7a7a9a] hover:text-slate-800 dark:hover:text-[#e8e8f0] text-sm font-semibold hover:bg-slate-100 dark:hover:bg-[#1e1e28] px-3 py-1.5 rounded-lg transition-all"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {t('examReview.back')}
        </button>
        <div className="w-px h-5 bg-slate-200 dark:bg-[#2a2a38]" />
        <span className="text-sm font-semibold">{t('examReview.attemptReview')}</span>

        <div className="ml-auto">
          {decided === 'approved' && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-50 dark:bg-[#0a1a14] border border-emerald-200 dark:border-[#1a4030] text-emerald-600 dark:text-[#22d3a0]">
              {t('examReview.approved')}
            </span>
          )}
          {decided === 'flagged' && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-red-50 dark:bg-[#1a0f0f] border border-red-200 dark:border-[#3a1a1a] text-red-500 dark:text-[#ff5c5c]">
              {t('examReview.flagged')}
            </span>
          )}
          {!decided && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-amber-50 dark:bg-[#1a1505] border border-amber-200 dark:border-[#4a3800] text-amber-600 dark:text-[#f5c518]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-[#f5c518] animate-pulse" />
              {t('examReview.examAttempt')}
            </span>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT PANEL ── */}
        <div className="w-[300px] min-w-[300px] border-r border-slate-200 dark:border-[#2a2a38] overflow-y-auto flex flex-col bg-white dark:bg-[#111118]">
          {isLoading || !attempt ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-[3px] border-slate-200 dark:border-[#2a2a38] border-t-[#0061EF] rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Meta */}
              <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-[#2a2a38]">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#7a7a9a] font-mono mb-1.5">
                  {t('examReview.examAttempt')}
                </div>
                <div className="text-lg font-black text-slate-800 dark:text-[#e8e8f0] mb-1">
                 {t('examReview.attemptNumber', { id: attempt.attemptId })}
                </div>
                <div className="text-[11px] font-mono text-slate-400 dark:text-[#7a7a9a]">
                  {new Date(attempt.startedAt).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </div>
              </div>

              {/* Score ring */}
              <div className="p-5 border-b border-slate-100 dark:border-[#2a2a38] flex items-center gap-4">
                <svg width="72" height="72" viewBox="0 0 72 72">
                  <circle cx="36" cy="36" r="28" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-[#1e1e28]" />
                  <circle cx="36" cy="36" r="28" fill="none" stroke={ringColor}
                    strokeWidth="8" strokeDasharray={circumference}
                    strokeDashoffset={offset} strokeLinecap="round"
                    transform="rotate(-90 36 36)" />
                </svg>
                <div>
                  <div className="text-3xl font-black leading-none" style={{ color: ringColor }}>{pct}%</div>
                  <div className="text-[11px] font-mono text-slate-400 dark:text-[#7a7a9a] mt-0.5">{t('examReview.score')}</div>
                  <div className="text-sm font-semibold text-slate-700 dark:text-[#e8e8f0] mt-1.5">
                    {attempt.score} / {attempt.totalPoints} pts
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-px bg-slate-100 dark:bg-[#2a2a38] border-b border-slate-100 dark:border-[#2a2a38]">
                {[
                  { label: t('examReview.correct'),    val: attempt.correctAnswers,  color: 'text-emerald-500' },
                  { label: t('examReview.wrong'),      val: attempt.wrongAnswers,    color: 'text-red-500' },
                  { label: t('examReview.skipped'),    val: attempt.unanswered ?? 0, color: 'text-amber-500' },
                  { label: t('examReview.violations'), val: attempt.violationCount,
                    color: attempt.violationCount > 0 ? 'text-red-500' : 'text-slate-400 dark:text-[#7a7a9a]' },
                ].map((s) => (
                  <div key={s.label} className="bg-white dark:bg-[#111118] p-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#7a7a9a] font-mono mb-1">{s.label}</div>
                    <div className={`text-xl font-bold ${s.color}`}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Violation banner */}
              {attempt.violationReason && (
                <div className="mx-4 my-4 p-3 bg-red-50 dark:bg-[#1a0f0f] border border-red-100 dark:border-[#3a1a1a] rounded-xl">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-500 uppercase tracking-wide mb-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m10.29 3.86-8.4 14.5A1 1 0 0 0 2.74 20h16.52a1 1 0 0 0 .86-1.5L11.71 3.86a1 1 0 0 0-1.72 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    {t('examReview.violationDetected')}
                  </div>
                  <div className="text-xs text-red-400 leading-relaxed">{attempt.violationReason}</div>
                </div>
              )}

              {/* Action panel */}
              <div className="p-4 mt-auto border-t border-slate-100 dark:border-[#2a2a38] bg-slate-50 dark:bg-[#111118]">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#7a7a9a] font-mono mb-3">
                  {t('examReview.instructorDecision')}
                </div>

                {decided ? (
                  <div className="text-center py-2">
                    <div className="text-2xl mb-2">{decided === 'approved' ? '✓' : '⚑'}</div>
                    <div className={`text-sm font-bold ${decided === 'approved' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {decided === 'approved' ? t('examReview.approvedAndPassed') : t('examReview.flaggedAndFailed')}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-[#7a7a9a] mt-1 font-mono">
                      {t('examReview.studentWillBeNotified')}
                    </div>
                    <button
                      className="mt-3 w-full py-2.5 rounded-xl border border-slate-200 dark:border-[#2a2a38] text-slate-500 dark:text-[#7a7a9a] text-sm font-bold hover:bg-slate-100 dark:hover:bg-[#1e1e28] transition-colors"
                      onClick={() => navigate(-1)}
                    >
                      {t('examReview.backToList')}
                    </button>
                  </div>

                ) : publishMut.isSuccess ? (
                  <div className="text-center py-2">
                    <div className="text-2xl mb-2">📤</div>
                    <div className="text-sm font-bold text-emerald-500">{t('examReview.gradesPublished')}</div>
                    <div className="text-[11px] text-slate-400 dark:text-[#7a7a9a] mt-1 font-mono">
                     {t('examReview.allStudentsCanSeeResults')}
                    </div>
                    <button
                      className="mt-3 w-full py-2.5 rounded-xl border border-slate-200 dark:border-[#2a2a38] text-slate-500 dark:text-[#7a7a9a] text-sm font-bold hover:bg-slate-100 dark:hover:bg-[#1e1e28] transition-colors"
                      onClick={() => navigate(-1)}
                    >
                      {t('examReview.backToList')}
                    </button>
                  </div>

                ) : (attempt.violationCount ?? 0) === 0 ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-[11px] text-slate-500 dark:text-[#7a7a9a] leading-relaxed mb-1">
                      {t('examReview.noViolationsDesc')}
                    </p>
                    <button
                      onClick={() => publishMut.mutate()}
                      disabled={publishMut.isPending}
                      className="w-full py-2.5 rounded-xl bg-[#0061EF] hover:bg-[#0052cc] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                    >
                      {publishMut.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {t('examReview.publishing')}
                        </>
                      ) : (
                        t('examReview.publishGrades')
                      )}
                    </button>
                    {publishMut.isError && (
                      <p className="text-[11px] text-red-400 text-center mt-1">
                       {t('examReview.failedToPublish')}
                      </p>
                    )}
                  </div>

                ) : !showRejectForm ? (
                  <div className="flex flex-col gap-2">
                    <button
                      disabled={resolveMut.isPending}
                      onClick={() => resolveMut.mutate()}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                    >
                      {resolveMut.isPending
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : '✓'}
                      {t('examReview.approveAndPass')}
                    </button>
                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="w-full py-2.5 rounded-xl border-2 border-red-100 dark:border-[#3a1a1a] text-red-500 hover:bg-red-50 dark:hover:bg-[#1a0f0f] text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      {t('examReview.flagAndFail')}
                    </button>
                  </div>

                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-[11px] text-slate-500 dark:text-[#7a7a9a] leading-relaxed">
                      {t('examReview.provideReasonForFlagging')}
                    </p>
                    <textarea
                      rows={3}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder={t('examReview.describeViolation')}
                      className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-[#1e1e28] border border-slate-200 dark:border-[#3a3a50] text-slate-800 dark:text-[#e8e8f0] placeholder:text-slate-400 dark:placeholder:text-[#7a7a9a] focus:outline-none focus:border-red-400 resize-none font-mono"
                    />
                    <button
                      disabled={flagMut.isPending}
                      onClick={() => flagMut.mutate()}
                      className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                    >
                      {flagMut.isPending
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : '⚑'}
                      {t('examReview.confirmFlagAndFail')}
                    </button>
                    <button
                      onClick={() => { setShowRejectForm(false); setRejectReason(''); }}
                      className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-[#2a2a38] text-slate-500 dark:text-[#7a7a9a] text-sm font-bold hover:bg-slate-100 dark:hover:bg-[#1e1e28] transition-colors"
                    >
                      {t('examReview.cancel')}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT PANEL: Questions ── */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-[3px] border-slate-200 dark:border-[#2a2a38] border-t-[#0061EF] rounded-full animate-spin" />
            </div>
          )}

          {!isLoading && attempt && (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-slate-800 dark:text-[#e8e8f0]">{t('examReview.questionBreakdown')}</span>
                <span className="font-mono text-xs text-slate-400 dark:text-[#7a7a9a] bg-slate-100 dark:bg-[#18181f] border border-slate-200 dark:border-[#2a2a38] px-3 py-0.5 rounded-full">
                 { `${attempt.totalQuestions} ${t('examReview.questions')}`}
                </span>
              </div>

              <div className="space-y-2.5">
                {(attempt.questions ?? []).map((q: any, idx: number) => (
                  <div key={q.questionId}
                    className={`bg-white dark:bg-[#111118] border border-slate-100 dark:border-[#2a2a38] rounded-xl overflow-hidden transition-colors hover:border-slate-200 dark:hover:border-[#3a3a50] ${
                      q.isCorrect ? 'border-l-[3px] border-l-emerald-400' : 'border-l-[3px] border-l-red-400'
                    }`}
                  >
                    <div className="p-4 flex items-start gap-3">
                      <span className="font-mono text-[11px] font-semibold text-slate-400 dark:text-[#7a7a9a] min-w-[24px] pt-0.5">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1 text-sm font-medium text-slate-800 dark:text-[#e8e8f0] leading-relaxed">
                        {q.questionText}
                      </span>
                      <span className={`font-mono text-[11px] px-2 py-0.5 rounded shrink-0 ${
                        q.isCorrect
                          ? 'bg-emerald-50 dark:bg-[#0a1a14] text-emerald-600 dark:text-[#22d3a0] border border-emerald-100 dark:border-[#1a3a2a]'
                          : 'bg-red-50 dark:bg-[#1a0f0f] text-red-500 dark:text-[#ff5c5c] border border-red-100 dark:border-[#3a1a1a]'
                      }`}>
                        {q.isCorrect ? `+${q.earnedPoints}` : '0'} pts
                      </span>
                      <span className={`text-base font-bold ${q.isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                        {q.isCorrect ? '✓' : '✕'}
                      </span>
                    </div>

                    <div className="px-4 pb-4 pl-[43px] flex flex-col gap-1.5">
                      {(q.options ?? []).map((opt: any) => {
                        const correctSelected = opt.wasSelected && opt.isCorrect;
                        const wrongSelected   = opt.wasSelected && !opt.isCorrect;
                        const correctOnly     = !opt.wasSelected && opt.isCorrect;
                        return (
                          <div key={opt.optionId}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono border ${
                              correctSelected
                                ? 'bg-emerald-50 dark:bg-[#0a1a14] text-emerald-700 dark:text-[#22d3a0] border-emerald-100 dark:border-[#1a3a2a]'
                                : wrongSelected
                                ? 'bg-red-50 dark:bg-[#1a0f0f] text-red-600 dark:text-[#ff5c5c] border-red-100 dark:border-[#3a1a1a]'
                                : correctOnly
                                ? 'bg-emerald-50/50 dark:bg-[#0a130e] text-emerald-600 dark:text-[#4a8a6a] border-emerald-100/50 dark:border-[#1a3028]'
                                : 'bg-slate-50 dark:bg-[#18181f] text-slate-500 dark:text-[#7a7a9a] border-slate-100 dark:border-[#2a2a38]'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              correctSelected ? 'bg-emerald-500'
                              : wrongSelected ? 'bg-red-500'
                              : 'bg-slate-300 dark:bg-[#3a3a50]'
                            }`} />
                            {opt.text}
                            {correctSelected && <span className="ml-auto text-[10px] uppercase tracking-wide font-bold text-emerald-500 dark:text-[#4a8a6a]">{t('examReview.selectedCorrect')}</span>}
                            {wrongSelected    && <span className="ml-auto text-[10px] uppercase tracking-wide font-bold text-red-400">{t('examReview.wrongSelected')}</span>}
                            {correctOnly      && <span className="ml-auto text-[10px] uppercase tracking-wide font-bold text-emerald-500 dark:text-[#4a8a6a]">{t('examReview.correctAnswer')}</span>}
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
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #CBD5E1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #475569; }
      `}</style>
    </div>
  );
}