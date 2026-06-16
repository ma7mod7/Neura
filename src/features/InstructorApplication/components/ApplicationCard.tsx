import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Calendar, ChevronRight } from 'lucide-react';
import { GlassCard } from './ApplicationUI';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import type { InstructorApplication } from '../types/instructorApplication.types';

interface Props {
  app: InstructorApplication;
  onReview: (id: number) => void;
}

export const ApplicationCard: React.FC<Props> = ({ app, onReview }) => {
  const { t } = useTranslation();
  return (
    <GlassCard className="p-5 hover:border-[#0061EF]/30 dark:hover:border-[#0061EF]/30 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-[#0061EF]/10 dark:bg-[#0061EF]/15 flex items-center justify-center shrink-0">
            <User size={20} className="text-[#0061EF]" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 dark:text-white truncate">{app.userName ?? `#${app.userId}`}</h3>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
              {app.userEmail && <span className="flex items-center gap-1.5"><Mail size={12} />{app.userEmail}</span>}
              <span className="flex items-center gap-1.5"><Calendar size={12} />{new Date(app.createdOn).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{app.bio}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3 shrink-0">
          <ApplicationStatusBadge status={app.status} />
          <button onClick={() => onReview(app.id)} className="flex items-center gap-1.5 text-sm font-bold text-[#0061EF] hover:gap-2.5 transition-all duration-200">
            {t('instructorApp.viewApplication')}
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </GlassCard>
  );
};