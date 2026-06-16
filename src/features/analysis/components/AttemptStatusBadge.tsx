import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AttemptReviewStatus } from '../types/analysis.types';

const CONFIG: Record<AttemptReviewStatus, { icon: React.ReactNode; color: string; bg: string; key: string }> = {
  UnderReview: { icon: <Clock size={12} />,        color: '#f59e0b', bg: '#f59e0b18', key: 'attemptReview.status.underReview' },
  Approved:    { icon: <CheckCircle2 size={12} />, color: '#10b981', bg: '#10b98118', key: 'attemptReview.status.approved' },
  Rejected:    { icon: <XCircle size={12} />,      color: '#ef4444', bg: '#ef444418', key: 'attemptReview.status.rejected' },
};

export const AttemptStatusBadge: React.FC<{ status: AttemptReviewStatus; className?: string }> = ({ status, className = '' }) => {
  const { t } = useTranslation();
  const cfg = CONFIG[status] ?? CONFIG.UnderReview;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${className}`} style={{ color: cfg.color, background: cfg.bg }}>
      {cfg.icon}
      {t(cfg.key)}
    </span>
  );
};