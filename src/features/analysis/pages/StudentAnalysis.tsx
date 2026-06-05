import React, { useState, useEffect } from 'react';
import { StatsHeroBar }    from '../components/StatsHeroBar';
import { ExamPicker }      from '../components/ExamPicker';
import { ScoreTrendChart } from '../components/ScoreTrendChart';
import { AttemptsTable }   from '../components/AttemptsTable';
import { ExamSummaryCard } from '../components/ExamSummaryCard';
import { useStudentExamList }                from '../hooks/useExamList';
import { useExamAnalytics, useExamAttempts } from '../hooks/useExamAnalytics';
import { useTranslation } from 'react-i18next';
import NavBar from '../../../shared/components/NavBar';

interface Props { userName: string; }

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children, className = '',
}) => (
  <div className={`bg-white dark:bg-[#1c1c1f] border border-blue-500/30 dark:border-blue-900/30 rounded-2xl shadow-sm ${className}`}>
    {children}
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{children}</h2>
);

const is403 = (error: unknown) =>
  (error as any)?.response?.status === 403 || (error as any)?.status === 403;

const BackendPendingBanner = ({ t }: { t: (key: string) => string }) => (
  <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-5 flex items-start gap-3">
    <span className="text-2xl shrink-0">🔧</span>
    <div>
      <p className="font-semibold text-amber-800 dark:text-amber-400 text-sm">{t('analysis.analyticsComingSoon')}</p>
      <p className="text-amber-700 dark:text-amber-500 text-sm mt-1">
        Your exam data is recorded but the analytics view requires a backend update.
        Ask your instructor or check back later.
      </p>
    </div>
  </div>
);

export const StudentAnalysis: React.FC<Props> = ({ userName }) => {
  const { t } = useTranslation();
  const { exams, isLoading: examsLoading } = useStudentExamList();
  const STORAGE_KEY = 'analysis_selected_exam';
  const [scrolled, setScrolled] = useState(false);

  const [selectedExamId, setSelectedExamId] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY)
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (exams.length === 0) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    const isValid = saved && exams.some(e => e.examId === saved);
    if (!isValid) {
      setSelectedExamId(exams[0].examId);
      localStorage.setItem(STORAGE_KEY, exams[0].examId);
    }
  }, [exams]);

  const handleExamChange = (examId: string) => {
    setSelectedExamId(examId);
    localStorage.setItem(STORAGE_KEY, examId);
  };

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useExamAnalytics(selectedExamId);
  const { data: attemptsRaw, isLoading: attemptsLoading, error: attemptsError } = useExamAttempts(selectedExamId);

  const attempts = Array.isArray(attemptsRaw)
    ? attemptsRaw
    : Array.isArray((attemptsRaw as any)?.attempts)
      ? (attemptsRaw as any).attempts
      : Array.isArray((attemptsRaw as any)?.items)
        ? (attemptsRaw as any).items
        : [];

  const isForbidden = is403(analyticsError) || is403(attemptsError);

  const heroStats = analytics
    ? [
        { label:  t('analysis.avgScore'),      value: `${Math.round(analytics.averageScorePercentage)}%` },
        { label: t('analysis.totalAttempts'), value: String(analytics.totalAttempts) },
        { label: t('analysis.passRate'),      value: `${Math.round(analytics.passRate)}%` },
        { label: t('analysis.bestScore'),     value: `${analytics.highestScorePercentage}%` },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0e0e10] pb-16 font-inter">
      <div className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/70 dark:bg-[#0e0e10]/0 backdrop-blur-md shadow-sm' : 'bg-white dark:bg-[#0e0e10]'
      }`}>
        <NavBar />
      </div>

      <div className="max-w-[1450px] mx-auto px-4 md:px-8 pt-6 space-y-6">
        <StatsHeroBar
          subtitle={t('analysis.performanceOverview')}
          title={`${t('analysis.hello')}, ${userName.split(' ')[0]} `}
          stats={analyticsLoading ? [] : heroStats}
        />

        {/* Exam picker */}
        <Card className="p-4">
          <ExamPicker
            exams={exams}
            selected={selectedExamId}
            onChange={handleExamChange}
            loading={examsLoading}
          />
        </Card>

        {!examsLoading && !exams.length && (
          <Card className="p-10 flex flex-col items-center gap-3 text-center">
            <span className="text-4xl">📭</span>
            <p className="text-gray-700 dark:text-gray-300 font-semibold">{t('analysis.noExamsFound')}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {t('analysis.noExamsStudent')}.
            </p>
          </Card>
        )}

        {selectedExamId && (
          <>
            {isForbidden && <BackendPendingBanner t={t} />}
            {!isForbidden && (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <Card className="xl:col-span-2 p-5">
                    <SectionTitle>{t('analysis.scoreOverAttempts')}</SectionTitle>
                    <ScoreTrendChart attempts={attempts} loading={attemptsLoading} />
                  </Card>
                  <Card className="p-5">
                    <SectionTitle> {t('analysis.examSummary')}</SectionTitle>
                    <ExamSummaryCard analytics={analytics} loading={analyticsLoading} />
                  </Card>
                </div>
                <Card className="p-5">
                  <SectionTitle>{t('analysis.yourAttempts')}</SectionTitle>
                  <AttemptsTable
                    attempts={attempts}
                    loading={attemptsLoading}
                    showStudent={false}
                    examId={selectedExamId}
                  />
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};