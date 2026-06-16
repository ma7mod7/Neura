import React from 'react';
import { FileEdit, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ExamReviewStatus } from '../types/analysis.types';

const STATUS_CONFIG: Record<ExamReviewStatus, { icon: React.ReactNode; color: string; bg: string; key: string }> = {
  Draft:         { icon: <FileEdit size={12} />,     color: '#64748b', bg: '#64748b18', key: 'examReview.status.draft' },
  PendingReview: { icon: <Clock size={12} />,        color: '#f59e0b', bg: '#f59e0b18', key: 'examReview.status.pending' },
  Approved:      { icon: <CheckCircle2 size={12} />, color: '#10b981', bg: '#10b98118', key: 'examReview.status.approved' },
  Rejected:      { icon: <XCircle size={12} />,      color: '#ef4444', bg: '#ef444418', key: 'examReview.status.rejected' },
};

export const ExamStatusBadge: React.FC<{ status: ExamReviewStatus; className?: string }> = ({ status, className = '' }) => {
  const { t } = useTranslation();
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.Draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${className}`}
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.icon}
      {t(cfg.key)}
    </span>
  );
};