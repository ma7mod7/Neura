import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ApplicationStatusCode } from '../types/instructorApplication.types';

const CONFIG: Record<ApplicationStatusCode, { icon: React.ReactNode; color: string; bg: string; key: string }> = {
  0: { icon: <Clock size={12} />,        color: '#f59e0b', bg: '#f59e0b18', key: 'instructorApp.status.pending' },
  1: { icon: <CheckCircle2 size={12} />, color: '#10b981', bg: '#10b98118', key: 'instructorApp.status.approved' },
  2: { icon: <XCircle size={12} />,      color: '#ef4444', bg: '#ef444418', key: 'instructorApp.status.rejected' },
};

export const ApplicationStatusBadge: React.FC<{ status: ApplicationStatusCode; className?: string }> = ({ status, className = '' }) => {
  const { t } = useTranslation();
  const cfg = CONFIG[status] ?? CONFIG[0];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${className}`} style={{ color: cfg.color, background: cfg.bg }}>
      {cfg.icon}
      {t(cfg.key)}
    </span>
  );
};