import React, { useState, useEffect } from 'react';
import { StatsHeroBar }   from '../components/StatsHeroBar';
import { ExamPicker }     from '../components/ExamPicker';
import { ScoreDistChart } from '../components/ScoreDistChart';
import { AttemptsTable }  from '../components/AttemptsTable';
import { ExamSummaryCard } from '../components/ExamSummaryCard';
import { useInstructorExamList }                                from '../hooks/useExamList';
import { useExamAnalytics, useExamAttempts, useScoreDistribution } from '../hooks/useExamAnalytics';
import NavBar from '../../../shared/components/NavBar';
import { useTranslation } from 'react-i18next';

interface Props { userName: string; }

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children, className = '',
}) => (
  <div className={`bg-white dark:bg-[#1c1c1f] border border-blue-100/50 dark:border-blue-900/30 rounded-2xl shadow-sm ${className}`}>
    {children}
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{children}</h2>
);

export const InstructorAnalysis: React.FC<Props> = ({ userName }) => {
  const { t } = useTranslation();
  const { exams, isLoading: examsLoading } = useInstructorExamList();
  const STORAGE_KEY = 'analysis_selected_exam_instructor';
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

  const { data: analytics,       isLoading: analyticsLoading } = useExamAnalytics(selectedExamId);
  const { data: attemptsApiRaw,  isLoading: attemptsLoading  } = useExamAttempts(selectedExamId);
  const { data: distributionRaw, isLoading: distLoading      } = useScoreDistribution(selectedExamId);

  const attemptsRaw  = Array.isArray(attemptsApiRaw)  ? attemptsApiRaw  : (attemptsApiRaw  as any)?.attempts ?? (attemptsApiRaw  as any)?.items ?? attemptsApiRaw;
  const attempts     = Array.isArray(attemptsRaw)     ? attemptsRaw     : [];
  const distribution = Array.isArray(distributionRaw) ? distributionRaw : [];

  const heroStats = analytics
    ? [
        { label: t('analysis.classAverage'),   value: `${Math.round(analytics.averageScorePercentage)}%` },
        { label: t('analysis.totalAttempts'),  value: String(analytics.totalAttempts) },
        { label: t('analysis.uniqueStudents'), value: String(analytics.uniqueStudents) },
        { label: t('analysis.passRate'),       value: `${Math.round(analytics.passRate)}%` },
        { label: t('analysis.highestScore'),   value: `${Math.round(analytics.highestScorePercentage)}%` },
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
          subtitle={t('analysis.classDashboard')}
          title={`${t('analysis.welcomeBack')}, ${userName.split(' ')[0]}`}
          stats={analyticsLoading ? [] : heroStats}
          gradient="bg-gradient-to-r from-blue-900 via-[#0061EF] to-sky-600"
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
              {t('analysis.noExamsInstructor')}
            </p>
          </Card>
        )}

        {selectedExamId && (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card className="xl:col-span-2 p-5">
                <SectionTitle>{t('analysis.scoreDistribution')}</SectionTitle>
                <ScoreDistChart data={distribution} loading={distLoading} />
              </Card>
              <Card className="p-5">
                <SectionTitle>{t('analysis.examSummary')}</SectionTitle>
                <ExamSummaryCard analytics={analytics} loading={analyticsLoading} />
              </Card>
            </div>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-1">
                <SectionTitle>{t('analysis.allStudentAttempts')}</SectionTitle>
                {!attemptsLoading && (
                  <span className="text-sm text-gray-400 dark:text-gray-500 mb-4">${attempts.length} ${t('analysis.total')}</span>
                )}
              </div>
              <AttemptsTable
                attempts={attempts}
                loading={attemptsLoading}
                showStudent={true}
                examId={selectedExamId}
              />
            </Card>
          </>
        )}
      </div>
    </div>
  );
};