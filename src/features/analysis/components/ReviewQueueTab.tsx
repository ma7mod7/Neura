import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, CheckCircle2, XCircle, ListChecks, Inbox } from 'lucide-react';
import { GlassCard, StatCard, SectionHeader } from './AnalysisUI';
import { ExamReviewCard } from './ExamReviewCard';
import { ExamReviewDetailModal } from './ExamReviewDetailModal';
import { usePendingReviewExams, useReviewHistory, useExamReviewStats } from '../hooks/useExamReview';

export const ReviewQueueTab: React.FC = () => {
  const { t } = useTranslation();
  const { data: pending, isLoading: pendingLoading } = usePendingReviewExams();
  const { data: history, isLoading: historyLoading } = useReviewHistory();
  const { data: stats, isLoading: statsLoading } = useExamReviewStats();
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  const pendingItems = pending ?? [];
  const historyItems = history ?? [];

  const statCards = stats
    ? [
        { icon: <Clock size={18} />,        label: t('examReview.pendingCount'),  value: String(stats.pendingCount),  color: '#f59e0b' },
        { icon: <CheckCircle2 size={18} />, label: t('examReview.approvedToday'), value: String(stats.approvedToday), color: '#10b981' },
        { icon: <XCircle size={18} />,      label: t('examReview.rejectedCount'), value: String(stats.rejectedCount), color: '#ef4444' },
        { icon: <ListChecks size={18} />,   label: t('examReview.totalReviewed'), value: String(stats.totalReviewed), color: '#0061EF' },
      ]
    : null;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading || !statCards
          ? Array.from({ length: 4 }).map((_, i) => <GlassCard key={i} className="p-5 h-28 animate-pulse" children={undefined} />)
          : statCards.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Pending queue */}
      <GlassCard className="p-6">
        <SectionHeader
          icon={<Clock size={15} />}
          title={t('examReview.pendingQueue')}
          badge={!pendingLoading ? `${pendingItems.length} ${t('examReview.waiting')}` : undefined}
        />
        {pendingLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-3xl bg-slate-100 dark:bg-[#2a2a2e] animate-pulse" />
            ))}
          </div>
        ) : pendingItems.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-900/15 flex items-center justify-center">
              <Inbox size={26} className="text-emerald-500" />
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-bold">{t('examReview.allCaughtUp')}</p>
            <p className="text-sm text-slate-400 max-w-xs">{t('examReview.noPendingDesc')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingItems.map((item) => (
              <ExamReviewCard key={item.examId} item={item} onReview={setReviewingId} />
            ))}
          </div>
        )}
      </GlassCard>

      {/* History */}
      <GlassCard className="p-6">
        <SectionHeader icon={<ListChecks size={15} />} title={t('examReview.recentDecisions')} />
        {historyLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-20 rounded-3xl bg-slate-100 dark:bg-[#2a2a2e] animate-pulse" />
            ))}
          </div>
        ) : historyItems.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8">{t('examReview.noHistory')}</p>
        ) : (
          <div className="space-y-3">
            {historyItems.map((item) => (
              <ExamReviewCard key={item.examId} item={item} onReview={setReviewingId} />
            ))}
          </div>
        )}
      </GlassCard>

      {reviewingId != null && (
        <ExamReviewDetailModal examId={reviewingId} onClose={() => setReviewingId(null)} />
      )}
    </div>
  );
};