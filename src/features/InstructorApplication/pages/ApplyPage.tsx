import { useTranslation } from 'react-i18next';
import { FileText, Loader2 } from 'lucide-react';
import NavBar from '../../../shared/components/NavBar';
import { MeshBackground, GlassCard, SectionHeader } from '../components/ApplicationUI';
import { ApplicationStatusBanner } from '../components/ApplicationStatusBanner';
import { ApplicationForm } from '../components/ApplicationForm';
import { useMyApplicationStatus, useSubmitApplication, useUpdateApplication } from '../hooks/useInstructorApplication';
import type { InstructorApplicationFormValues } from '../schema/instructorApplication.schema';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export default function ApplyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading } = useMyApplicationStatus();
  const submitMut = useSubmitApplication();
  const updateMut = useUpdateApplication();

  const handleSubmit = (values: InstructorApplicationFormValues) => {
    if (data?.hasApplication && data.status === 0) {
      updateMut.mutate(values);
    } else {
      submitMut.mutate(values);
    }
  };

  const showForm = !isLoading && data && (data.canApply || (data.hasApplication && data.status === 0) || data.status === 2);

  return (
    <div className="min-h-screen font-inter pb-20">
      <MeshBackground />
      <div className="sticky top-0 z-50 bg-white/70 dark:bg-[#0e0e10]/80 backdrop-blur-2xl border-b border-slate-200/60 dark:border-[#2a2a2e]/80">
        <NavBar />
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-8 pt-10 space-y-6">
        <div className="text-center mb-2">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">{t('instructorApp.pageTitle')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{t('instructorApp.pageSubtitle')}</p>
        </div>

        {isLoading || !data ? (
          <GlassCard className="p-10 flex items-center justify-center">
            <Loader2 size={28} className="animate-spin text-[#0061EF]" />
          </GlassCard>
        ) : (
          <>
            <ApplicationStatusBanner data={data} />

            {showForm && (
              <GlassCard className="p-6 md:p-8">
                <SectionHeader
                  icon={<FileText size={15} />}
                  title={data.status === 2 ? t('instructorApp.reapplyTitle') : data.hasApplication ? t('instructorApp.editTitle') : t('instructorApp.formTitle')}
                />
                {data.hasApplication && data.status === 0 ? (
                // Already submitted 
                <div className="flex flex-col items-center gap-4 py-6">
                    <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-400 font-bold px-6 py-3 rounded-2xl text-sm">
                    <CheckCircle2 size={18} />
                    Application Submitted
                    </div>
                    <button
                    onClick={() => navigate('/announcements')}
                    className="text-[#0061EF] hover:underline text-sm font-semibold flex items-center gap-1"
                    >
                    ← Back to Home
                    </button>
                </div>
                ) : (
                <ApplicationForm
                    onSubmit={handleSubmit}
                    isPending={submitMut.isPending || updateMut.isPending}
                    submitLabel={t('instructorApp.submitApplication')}
                />
                )}
                {(submitMut.isError || updateMut.isError) && (
                  <p className="text-xs text-red-500 mt-3 text-center">{t('instructorApp.submitError')}</p>
                )}
              </GlassCard>
            )}
          </>
        )}
      </div>
    </div>
  );
}