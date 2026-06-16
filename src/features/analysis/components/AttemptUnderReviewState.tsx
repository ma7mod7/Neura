import React, { useEffect,useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardCheck, Hourglass } from 'lucide-react';
import { useMyAttemptReviewStatus } from '../hooks/useAttemptReview';

interface Props {
  attemptId: number | string;
  onResolved?: (status: 'Approved' | 'Rejected') => void;
}

export const AttemptUnderReviewState: React.FC<Props> = ({ attemptId, onResolved }) => {
  const { t } = useTranslation();
  const { data } = useMyAttemptReviewStatus(attemptId);
 const seenUnderReview = useRef(false);

  useEffect(() => {
    if (data?.status === 'UnderReview') {
      seenUnderReview.current = true;
    }
  }, [data?.status]);
    useEffect(() => {
    if (
      seenUnderReview.current &&
      (data?.status === 'Approved' || data?.status === 'Rejected')
    ) {
      onResolved?.(data.status);
    }
  }, [data?.status, onResolved]);

  return (
    <div className="flex flex-col items-center text-center gap-5 py-6">
      <div className="relative w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-900/15 flex items-center justify-center">
        <Hourglass size={32} className="text-amber-500 animate-pulse" />
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0061EF] flex items-center justify-center border-4 border-white dark:border-[#1A1A1A]">
          <ClipboardCheck size={13} className="text-white" />
        </div>
      </div>
      <div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{t('attemptReview.underReviewTitle')}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">{t('attemptReview.underReviewDesc')}</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        {t('attemptReview.checkingStatus')}
      </div>
    </div>
  );
};