import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle2, XCircle, Mail, Calendar, Loader2 } from 'lucide-react';
import { useApplicationDetail, useApproveApplication, useRejectApplication } from '../hooks/useInstructorApplication';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';

interface Props {
  applicationId: number;
  onClose: () => void;
}

export const ApplicationDetailModal: React.FC<Props> = ({ applicationId, onClose }) => {
  const { t } = useTranslation();
  const { data: app, isLoading } = useApplicationDetail(applicationId);
  const approveMut = useApproveApplication();
  const rejectMut = useRejectApplication();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState('');

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl max-h-[85vh] overflow-hidden rounded-3xl border border-white/60 dark:border-[#2a2a2e] bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-2xl shadow-2xl flex flex-col">

        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-[#2a2a2e] shrink-0">
          <h3 className="font-black text-lg text-slate-900 dark:text-white truncate">{app?.userName ?? t('instructorApp.loadingApplication')}</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-[#2a2a2e] transition-colors shrink-0">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {isLoading || !app ? (
            <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-[#0061EF]" /></div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <ApplicationStatusBadge status={app.status} />
                {app.userEmail && <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><Mail size={12} />{app.userEmail}</span>}
                <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><Calendar size={12} />{new Date(app.createdOn).toLocaleDateString()}</span>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">{t('instructorApp.bioLabel')}</h4>
                <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">{app.bio}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">{t('instructorApp.experienceLabel')}</h4>
                <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">{app.experience}</p>
              </div>

              {app.status === 2 && app.rejectionReason && (
                <div className="rounded-2xl bg-red-50 dark:bg-red-900/10 p-4">
                  <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">{t('examReview.rejectionReason')}</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{app.rejectionReason}</p>
                </div>
              )}
            </>
          )}
        </div>

        {app?.status === 0 && (
          <div className="border-t border-slate-100 dark:border-[#2a2a2e] p-5 shrink-0">
            {!showRejectForm ? (
              <div className="flex items-center gap-3">
                <button onClick={() => approveMut.mutate(applicationId, { onSuccess: onClose })} disabled={approveMut.isPending} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-colors disabled:opacity-60">
                  {approveMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {t('instructorApp.approve')}
                </button>
                <button onClick={() => setShowRejectForm(true)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold text-sm transition-colors">
                  <XCircle size={16} />
                  {t('instructorApp.reject')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t('instructorApp.rejectionPlaceholder')} rows={3} className="w-full px-4 py-3 text-sm rounded-2xl bg-slate-50 dark:bg-[#0e0e10] text-slate-800 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-[#2a2a2e] focus:outline-none focus:border-red-400 transition-colors resize-none" />
                <div className="flex items-center gap-3">
                  <button onClick={() => { setShowRejectForm(false); setReason(''); }} className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-[#2a2a2e] text-slate-500 font-bold text-sm hover:bg-slate-50 dark:hover:bg-[#2a2a2e] transition-colors">{t('examReview.cancel')}</button>
                  <button onClick={() => rejectMut.mutate({ id: applicationId, reason: reason.trim() }, { onSuccess: onClose })} disabled={rejectMut.isPending || reason.trim().length < 5} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors disabled:opacity-50">
                    {rejectMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                    {t('examReview.confirmReject')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};