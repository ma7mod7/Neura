import  { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Clock, CheckCircle2, XCircle } from 'lucide-react';
import NavBar from '../../../shared/components/NavBar';
import { MeshBackground, GlassCard, SectionHeader } from '../components/ApplicationUI';
import { AnalysisTabs } from '../../analysis/components/AnalysisTabs';
import { ApplicationCard } from '../components/ApplicationCard';
import { ApplicationDetailModal } from '../components/ApplicationDetailModal';
import { useApplicationsList } from '../hooks/useInstructorApplication';
import type { ApplicationStatusCode } from '../types/instructorApplication.types';

const FILTERS: { id: string; status?: ApplicationStatusCode }[] = [
  { id: 'all' },
  { id: 'pending', status: 0 },
  { id: 'approved', status: 1 },
  { id: 'rejected', status: 2 },
];

export default function ApplicationsManagementPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('pending');
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  const activeFilter = FILTERS.find((f) => f.id === filter)!;
  const { data, isLoading } = useApplicationsList({ status: activeFilter.status, page: 1, pageSize: 50 });
  const items = data?.items ?? [];

  return (
    <div className="min-h-screen font-inter pb-20">
      <MeshBackground />
      <div className="sticky top-0 z-50 bg-white/70 dark:bg-[#0e0e10]/80 backdrop-blur-2xl border-b border-slate-200/60 dark:border-[#2a2a2e]/80">
        <NavBar />
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-10 space-y-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">{t('instructorApp.managementTitle')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{t('instructorApp.managementSubtitle')}</p>
        </div>

        <AnalysisTabs
          tabs={[
            { id: 'all', label: t('instructorApp.filterAll'), icon: <Users size={15} /> },
            { id: 'pending', label: t('instructorApp.filterPending'), icon: <Clock size={15} /> },
            { id: 'approved', label: t('instructorApp.filterApproved'), icon: <CheckCircle2 size={15} /> },
            { id: 'rejected', label: t('instructorApp.filterRejected'), icon: <XCircle size={15} /> },
          ]}
          active={filter}
          onChange={setFilter}
        />

        <GlassCard className="p-6">
          <SectionHeader icon={<Users size={15} />} title={t('instructorApp.applications')} badge={!isLoading ? `${items.length} ${t('examReview.total')}` : undefined} />
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-3xl bg-slate-100 dark:bg-[#2a2a2e] animate-pulse" />)}</div>
          ) : items.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-10">{t('instructorApp.noApplications')}</p>
          ) : (
            <div className="space-y-3">{items.map((app) => <ApplicationCard key={app.id} app={app} onReview={setReviewingId} />)}</div>
          )}
        </GlassCard>
      </div>

      {reviewingId != null && <ApplicationDetailModal applicationId={reviewingId} onClose={() => setReviewingId(null)} />}
    </div>
  );
}