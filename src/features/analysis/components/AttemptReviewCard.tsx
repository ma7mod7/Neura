import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, User, Clock, AlertTriangle, Award, ChevronRight } from 'lucide-react';
import { GlassCard } from './AnalysisUI';
import { AttemptStatusBadge } from './AttemptStatusBadge';
import type { AttemptReviewItem } from '../types/analysis.types';

interface Props {
  item: AttemptReviewItem;
  onReview: (attemptId: number) => void;
}

export const AttemptReviewCard: React.FC<Props> = ({ item, onReview }) => {
  const { t } = useTranslation();
  const submittedDate = new Date(item.submittedAt);

  return (
    <GlassCard className="p-5 hover:border-[#0061EF]/30 dark:hover:border-[#0061EF]/30 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-[#0061EF]/10 dark:bg-[#0061EF]/15 flex items-center justify-center shrink-0">
            <User size={20} className="text-[#0061EF]" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 dark:text-white truncate">{item.studentName}</h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <BookOpen size={12} />
              <span className="truncate">{item.examTitle} · {item.courseTitle}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Award size={12} />
                {Math.round(item.scorePercentage)}% ({item.score}/{item.totalPoints})
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {submittedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
              {item.violationCount > 0 && (
                <span className="flex items-center gap-1.5 text-red-500">
                  <AlertTriangle size={12} />
                  {item.violationCount} {t('attemptReview.violations')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          <AttemptStatusBadge status={item.status} />
          {item.status === 'UnderReview' && (
            <button onClick={() => onReview(item.attemptId)} className="flex items-center gap-1.5 text-sm font-bold text-[#0061EF] hover:gap-2.5 transition-all duration-200">
              {t('attemptReview.review')}
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
};