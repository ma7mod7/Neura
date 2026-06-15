import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Award, Target, Activity,
  BookOpen,  Sparkles, BarChart3,
} from 'lucide-react';
import { ExamPicker }      from '../components/ExamPicker';
import { ScoreTrendChart } from '../components/ScoreTrendChart';
import { AttemptsTable }   from '../components/AttemptsTable';
import { ExamSummaryCard } from '../components/ExamSummaryCard';
import { useStudentExamList }                from '../hooks/useExamList';
import { useStudentExamAnalytics, useStudentAttempts } from '../hooks/useExamAnalytics';
import { useTranslation } from 'react-i18next';
import NavBar from '../../../shared/components/NavBar';
import { useAuth } from '../../auth/hooks/useAuth';

interface Props { userName: string; }

// Mesh background 
function MeshBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[#F8FAFC] dark:bg-[#0e0e10]" />
      <div
        className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full opacity-25 dark:opacity-10"
        style={{ background: 'radial-gradient(circle, #0061EF 0%, transparent 70%)', filter: 'blur(80px)' }}
      />
      <div
        className="absolute top-1/3 -right-64 w-[600px] h-[600px] rounded-full opacity-15 dark:opacity-8"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(100px)' }}
      />
      <div
        className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #0061EF 0%, transparent 70%)', filter: 'blur(90px)' }}
      />
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,97,239,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,97,239,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}

// Floating particles
function FloatingParticles() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {[0,1,2,3,4,5].map((i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#0061EF]/30 dark:bg-[#0061EF]/20"
          style={{
            left: `${15 + i * 14}%`,
            top: `${20 + (i % 3) * 25}%`,
            animation: `float ${3 + i * 0.7}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes float {
          from { transform: translateY(0px) scale(1); opacity: 0.3; }
          to   { transform: translateY(-20px) scale(1.3); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

// Glass card
const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-3xl border border-white/60 dark:border-[#2a2a2e] bg-white/70 dark:bg-[#1A1A1A]/70 backdrop-blur-2xl shadow-xl shadow-black/5 dark:shadow-black/40 ${className}`}>
    {children}
  </div>
);

// Stat card 
function StatCard({ icon, label, value, color = '#0061EF' }: {
  icon: React.ReactNode; label: string; value: string; color?: string;
}) {
  return (
    <GlassCard className="p-5 flex flex-col gap-3 hover:scale-[1.01] transition-transform duration-200">
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center"
        style={{ background: `${color}18` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
      </div>
    </GlassCard>
  );
}

// Section header 
function SectionHeader({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 rounded-2xl bg-[#0061EF]/10 dark:bg-[#0061EF]/20 flex items-center justify-center">
        <span className="text-[#0061EF]">{icon}</span>
      </div>
      <h2 className="text-base font-bold text-slate-800 dark:text-white">{title}</h2>
      {badge && (
        <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0061EF]/10 text-[#0061EF] dark:bg-[#0061EF]/20 dark:text-blue-300">
          {badge}
        </span>
      )}
    </div>
  );
}

// Hero banner
function HeroBanner({
  userName, stats, loading,
}: {
  userName: string;
  stats: { label: string; value: string }[];
  loading: boolean;
}) {
  const { user } = useAuth();
  return (
    <div
      className="relative overflow-hidden rounded-3xl p-8 lg:p-10"
      style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0061EF 55%, #38bdf8 100%)' }}
    >
      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)', filter: 'blur(60px)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)', filter: 'blur(50px)', transform: 'translate(-20%, 30%)' }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          {user?.imageUrl && (
            <img
              src={user.imageUrl}
              alt="Profile"
              className="w-14 h-14 rounded-2xl border-2 border-white/30 object-cover shadow-xl"
            />
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles size={10} className="text-white" />
              </div>
              <span className="text-blue-200 text-xs font-semibold uppercase tracking-wider">Performance Overview</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white leading-tight">
              Hello, <span className="text-blue-200">{userName.split(' ')[0]}</span>
            </h1>
            <p className="text-blue-300/80 text-sm mt-1">Track your progress and review your exam history</p>
          </div>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap gap-3">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-white/10 w-24 h-16" />
              ))
            : stats.map((s) => (
                <div key={s.label}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 min-w-[90px] hover:bg-white/15 transition-colors">
                  <p className="text-blue-200 text-[10px] uppercase tracking-wide font-medium">{s.label}</p>
                  <p className="text-white font-black text-xl mt-0.5">{s.value}</p>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

// Backend pending banner
function BackendPendingBanner({ t }: { t: (key: string) => string }) {
  return (
    <GlassCard className="p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center shrink-0 text-xl">🔧</div>
      <div>
        <p className="font-bold text-amber-700 dark:text-amber-400 text-sm">{t('analysis.analyticsComingSoon')}</p>
        <p className="text-amber-600/80 dark:text-amber-500/80 text-sm mt-1">
          Your exam data is recorded but the analytics view requires a backend update. Check back soon.
        </p>
      </div>
    </GlassCard>
  );
}

const is403 = (error: unknown) =>
  (error as any)?.response?.status === 403 || (error as any)?.status === 403;

// Main component 
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
  const { data: attemptsRaw,     isLoading: attemptsLoading } = useStudentAttempts(selectedExamId);

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useStudentExamAnalytics(selectedExamId);
  // const { data: attemptsRaw, isLoading: attemptsLoading, error: attemptsError  } = useExamAttempts(selectedExamId);
  const attempts     = Array.isArray(attemptsRaw) ? attemptsRaw : [];

    const isForbidden = is403(analyticsError);

    const heroStats = analytics ? [
      { label: t('analysis.myScore'),        value: `${Math.round(analytics.studentScorePercentage ?? 0)}%` },
      { label: t('analysis.totalAttempts'),  value: String(analytics.totalStudentAttempts) },
      { label: t('analysis.classAverage'),   value: `${Math.round(analytics.classAveragePercentage)}%` },
      { label: t('analysis.classHighest'),   value: `${Math.round(analytics.classHighestPercentage)}%` },
    ] : [];

    const statCards = analytics ? [
      { icon: <BarChart3 size={18} />, label: t('analysis.myScore'),       value: `${Math.round(analytics.studentScorePercentage ?? 0)}%`, color: '#0061EF' },
      { icon: <Target size={18} />,    label: t('analysis.classAverage'),  value: `${Math.round(analytics.classAveragePercentage)}%`,      color: '#059669' },
      { icon: <Activity size={18} />,  label: t('analysis.myAttempts'),    value: String(analytics.totalStudentAttempts),                  color: '#0891b2' },
      { icon: <Award size={18} />,     label: t('analysis.classHighest'),  value: `${Math.round(analytics.classHighestPercentage)}%`,      color: '#7c3aed' },
    ] : null;

  return (
    <div className="min-h-screen font-inter pb-20">
      <MeshBackground />
      <FloatingParticles />

      {/* Navbar */}
      <div className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/70 dark:bg-[#0e0e10]/80 backdrop-blur-2xl border-b border-slate-200/60 dark:border-[#2a2a2e]/80 shadow-sm'
          : 'bg-transparent'
      }`}>
        <NavBar />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8 space-y-6">

        {/* Hero */}
        <HeroBanner userName={userName} stats={heroStats} loading={analyticsLoading} />

        {/* Quick stat cards */}
        {selectedExamId && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {analyticsLoading || !statCards
              ? Array.from({ length: 4 }).map((_, i) => (
                  <GlassCard key={i} className="p-5 h-28 animate-pulse" children={undefined} />
                ))
              : statCards.map((s) => (
                  <StatCard key={s.label} {...s} />
                ))}
          </div>
        )}

        {/* Exam picker */}
        <GlassCard className="p-5 overflow-visible">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-7 rounded-xl bg-[#0061EF]/10 dark:bg-[#0061EF]/20 flex items-center justify-center">
              <BookOpen size={13} className="text-[#0061EF]" />
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('analysis.selectExamLabel')}</span>
          </div>
          <ExamPicker
            exams={exams}
            selected={selectedExamId}
            onChange={handleExamChange}
            loading={examsLoading}
          />
        </GlassCard>

        {/* No exams empty state */}
        {!examsLoading && !exams.length && (
          <GlassCard className="p-14 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-[#222] flex items-center justify-center text-3xl">📭</div>
            <p className="text-slate-700 dark:text-slate-300 font-bold text-lg">{t('analysis.noExamsFound')}</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">{t('analysis.noExamsStudent')}.</p>
          </GlassCard>
        )}

       {selectedExamId && !isForbidden && (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <GlassCard className="xl:col-span-2 p-6">
                    <SectionHeader icon={<TrendingUp size={15} />} title={t('analysis.scoreOverAttempts')} />
                    <ScoreTrendChart attempts={attempts} loading={attemptsLoading} />
                  </GlassCard>

                  <GlassCard className="p-6">
                    <SectionHeader icon={<Target size={15} />} title={t('analysis.examSummary')} />
                    <ExamSummaryCard analytics={analytics} loading={analyticsLoading} mode="student" />
                  </GlassCard>
                </div>

                <GlassCard className="p-6">
                  <SectionHeader
                    icon={<Activity size={15} />}
                    title={t('analysis.yourAttempts')}
                    badge={!attemptsLoading ? `${attempts.length} ${t('analysis.total')}` : undefined}
                  />
                  <AttemptsTable
                    attempts={attempts}
                    loading={attemptsLoading}
                    showStudent={false}
                    examId={selectedExamId}
                  />
                </GlassCard>
              </>
            )}
            {selectedExamId && isForbidden && <BackendPendingBanner t={t} />}
      </div>
    </div>
  );
};