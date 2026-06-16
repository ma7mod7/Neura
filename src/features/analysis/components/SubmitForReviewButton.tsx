import React from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Loader2 } from 'lucide-react';
import { useSubmitForReview } from '../hooks/useExamReview';
import type { ExamReviewStatus } from '../types/analysis.types';

interface Props {
  examId: number | string;
  status: ExamReviewStatus;
  onSubmitted?: () => void;
}

export const SubmitForReviewButton: React.FC<Props> = ({ examId, status, onSubmitted }) => {
  const { t } = useTranslation();
  const submitMut = useSubmitForReview();

  if (status !== 'Draft' && status !== 'Rejected') return null;

  return (
    <button
      onClick={() => submitMut.mutate(examId, { onSuccess: onSubmitted })}
      disabled={submitMut.isPending}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0061EF] hover:bg-[#0052cc] text-white text-sm font-bold transition-colors disabled:opacity-60"
    >
      {submitMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
      {status === 'Rejected' ? t('examReview.resubmit') : t('examReview.submitForReview')}
    </button>
  );
};