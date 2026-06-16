import React from 'react';
import { useTranslation } from 'react-i18next';
import { Hourglass, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import type { MyApplicationStatus } from '../types/instructorApplication.types';

export const ApplicationStatusBanner: React.FC<{ data: MyApplicationStatus }> = ({ data }) => {
  const { t } = useTranslation();
  if (data.status === 0) {
    return (
      <div className="rounded-[2rem] p-8 lg:p-10 text-white" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #f59e0b 120%)' }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0"><Hourglass size={26} /></div>
          <div>
            <h2 className="text-xl font-black">{t('instructorApp.pendingTitle')}</h2>
            <p className="text-white/80 text-sm mt-1">{t('instructorApp.pendingDesc')}</p>
            {data.createdOn && <p className="text-white/60 text-xs mt-2">{t('instructorApp.submittedOn')}: {new Date(data.createdOn).toLocaleDateString()}</p>}
          </div>
        </div>
      </div>
    );
  }

  if (data.status === 1 || data.isInstructor) {
    return (
      <div className="rounded-[2rem] p-8 lg:p-10 text-white" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #10b981 120%)' }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0"><CheckCircle2 size={26} /></div>
          <div>
            <h2 className="text-xl font-black">{t('instructorApp.approvedTitle')}</h2>
            <p className="text-white/80 text-sm mt-1">{t('instructorApp.approvedDesc')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (data.status === 2) {
    return (
      <div className="rounded-[2rem] p-8 lg:p-10 text-white" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #ef4444 120%)' }}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0"><XCircle size={26} /></div>
          <div>
            <h2 className="text-xl font-black">{t('instructorApp.rejectedTitle')}</h2>
            {data.rejectionReason && <p className="text-white/80 text-sm mt-1">{data.rejectionReason}</p>}
            {data.canReapplyAfter && <p className="text-white/60 text-xs mt-2">{t('instructorApp.canReapplyAfter')}: {new Date(data.canReapplyAfter).toLocaleDateString()}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] p-8 lg:p-10 text-white" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0061EF 50%, #3b82f6 100%)' }}>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0"><Sparkles size={26} /></div>
        <div>
          <h2 className="text-xl font-black">{t('instructorApp.ctaTitle')}</h2>
          <p className="text-white/80 text-sm mt-1 max-w-md">{t('instructorApp.ctaDesc')}</p>
        </div>
      </div>
    </div>
  );
};