import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  BookOpen,
  Target,
  Activity,
  Sparkles,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Inbox,
  Send,
  Loader2,
} from "lucide-react";
import { ExamPicker } from "../components/ExamPicker";
import { ScoreDistChart } from "../components/ScoreDistChart";
import { AttemptsTable } from "../components/AttemptsTable";
import { ExamSummaryCard } from "../components/ExamSummaryCard";
import { GlassCard, StatCard, SectionHeader } from "../components/AnalysisUI";
import { AnalysisTabs } from "../components/AnalysisTabs";
import { useInstructorExamList } from "../hooks/useExamList";
import {
  useExamAnalytics,
  useExamAttempts,
  useScoreDistribution,
  usePublishGrades,
} from "../hooks/useExamAnalytics";
import {
  useExamViolations,
  useResolveViolation,
  useFlagViolation,
} from "../hooks/useViolationReview";
import NavBar from "../../../shared/components/NavBar";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/hooks/useAuth";

interface Props {
  userName: string;
}

function MeshBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[#F8FAFC] dark:bg-[#0e0e10]" />
      <div
        className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full opacity-25 dark:opacity-10"
        style={{
          background: "radial-gradient(circle, #0061EF 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute top-1/3 -right-64 w-[600px] h-[600px] rounded-full opacity-15 dark:opacity-8"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />
      <div
        className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full opacity-10 dark:opacity-6"
        style={{
          background: "radial-gradient(circle, #0061EF 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,97,239,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,97,239,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

function HeroBanner({
  userName,
  stats,
  loading,
}: {
  userName: string;
  stats: { label: string; value: string }[];
  loading: boolean;
}) {
  const { user } = useAuth();
  const { t } = useTranslation();
  return (
    <div
      className="relative overflow-hidden rounded-3xl p-8 lg:p-10"
      style={{
        background:
          "linear-gradient(135deg, #0a1628 0%, #0061EF 50%, #3b82f6 100%)",
      }}
    >
      <div
        className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
          filter: "blur(60px)",
          transform: "translate(30%, -30%)",
        }}
      />
      <div
        className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #60a5fa 0%, transparent 70%)",
          filter: "blur(50px)",
          transform: "translateY(30%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
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
              <span className="text-blue-200 text-xs font-semibold uppercase tracking-wider">
                {t("analysis.classDashboardLabel")}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white leading-tight">
              Welcome back,{" "}
              <span className="text-blue-200">{userName.split(" ")[0]}</span>
            </h1>
            <p className="text-blue-300/80 text-sm mt-1">
              {t("analysis.hereIsWhatsHappening")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl bg-white/10 w-28 h-16"
                />
              ))
            : stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 min-w-[100px] hover:bg-white/15 transition-colors"
                >
                  <p className="text-blue-200 text-[10px] uppercase tracking-wide font-medium">
                    {s.label}
                  </p>
                  <p className="text-white font-black text-xl mt-0.5">
                    {s.value}
                  </p>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

export const InstructorAnalysis: React.FC<Props> = ({ userName }) => {
  const { t } = useTranslation();
  const { exams, isLoading: examsLoading } = useInstructorExamList();
  const STORAGE_KEY = "analysis_selected_exam_instructor";
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<"myExams" | "violations">(
    "myExams",
  );

  const [selectedExamId, setSelectedExamId] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY),
  );

  const { data: violationsRaw, isLoading: violationsLoading } =
    useExamViolations(selectedExamId);
  const resolveMut = useResolveViolation(selectedExamId ?? "");
  const flagMut = useFlagViolation(selectedExamId ?? "");
  const violations = Array.isArray(violationsRaw)
    ? violationsRaw
    : ((violationsRaw as any)?.violations ?? []);
    console.log('violations:', violations);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (exams.length === 0) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    const isValid = saved && exams.some((e) => e.examId === saved);
    if (!isValid) {
      setSelectedExamId(exams[0].examId);
      localStorage.setItem(STORAGE_KEY, exams[0].examId);
    }
  }, [exams]);

  const handleExamChange = (examId: string) => {
    setSelectedExamId(examId);
    localStorage.setItem(STORAGE_KEY, examId);
  };

  const { data: analytics, isLoading: analyticsLoading } =
    useExamAnalytics(selectedExamId);
  const { data: attemptsApiRaw, isLoading: attemptsLoading } =
    useExamAttempts(selectedExamId);
  const { data: distributionRaw, isLoading: distLoading } =
    useScoreDistribution(selectedExamId);
  const publishMut = usePublishGrades(selectedExamId);
  const storageKey = `grades_published_${selectedExamId}`;
  const wasAlreadyPublished = localStorage.getItem(storageKey) === "true";
  // const [showImage, setShowImage] = useState(false); 
  const [openImageId, setOpenImageId] = useState<string | number | null>(null);
  // const alreadyPublished = publishMut.isSuccess &&
  // (publishMut.data as any)?.alreadyPublished === true;

  const isPublished =
    publishMut.isSuccess ||
    wasAlreadyPublished ||
    analytics?.areGradesPublished === true;

  const attemptsRaw = (attemptsApiRaw as any)?.attempts ?? [];
  const attempts = Array.isArray(attemptsRaw) ? attemptsRaw : [];
  const distribution = Array.isArray(distributionRaw)
    ? distributionRaw
    : ((distributionRaw as any)?.buckets ?? []);

  const heroStats = analytics
    ? [
        {
          label: t("analysis.classAverage"),
          value: `${Math.round(analytics.averageScorePercentage)}%`,
        },
        {
          label: t("analysis.totalAttempts"),
          value: String(analytics.totalAttempts),
        },
        {
          label: t("analysis.uniqueStudents"),
          value: String(analytics.uniqueStudents),
        },
        {
          label: t("analysis.passRate"),
          value: `${Math.round(analytics.passRate)}%`,
        },
        {
          label: t("analysis.highestScore"),
          value: `${Math.round(analytics.highestScorePercentage)}%`,
        },
      ]
    : [];

  const statCards = analytics
    ? [
        {
          icon: <BarChart3 size={18} />,
          label: t("analysis.classAverage"),
          value: `${Math.round(analytics.averageScorePercentage)}%`,
          color: "#0061EF",
        },
        {
          icon: <Users size={18} />,
          label: t("analysis.uniqueStudents"),
          value: String(analytics.uniqueStudents),
          color: "#7c3aed",
        },
        {
          icon: <Activity size={18} />,
          label: t("analysis.totalAttempts"),
          value: String(analytics.totalAttempts),
          color: "#0891b2",
        },
        {
          icon: <Target size={18} />,
          label: t("analysis.passRate"),
          value: `${Math.round(analytics.passRate)}%`,
          color: "#059669",
        },
      ]
    : null;

  return (
    <div className="min-h-screen font-inter pb-20">
      <MeshBackground />

      <div
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/70 dark:bg-[#0e0e10]/80 backdrop-blur-2xl border-b border-slate-200/60 dark:border-[#2a2a2e]/80 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <NavBar />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8 space-y-6">
        <HeroBanner
          userName={userName}
          stats={heroStats}
          loading={analyticsLoading}
        />

        <AnalysisTabs
          tabs={[
            {
              id: "myExams",
              label: t("analysis.myExams"),
              icon: <BarChart3 size={15} />,
            },
            {
              id: "violations",
              label: t("analysis.cheatingReviews"),
              icon: <ClipboardCheck size={15} />,
              badge: violations.length || undefined,
            },
          ]}
          active={activeTab}
          onChange={(id) => setActiveTab(id as "myExams" | "violations")}
        />

        {/* ── Exam Picker  */}
        <GlassCard className="p-5 overflow-visible">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-7 h-7 rounded-xl bg-[#0061EF]/10 dark:bg-[#0061EF]/20 flex items-center justify-center">
              <BookOpen size={13} className="text-[#0061EF]" />
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {t("analysis.selectExamLabel")}
            </span>
          </div>
          <div className="mt-3">
            <ExamPicker
              exams={exams}
              selected={selectedExamId}
              onChange={handleExamChange}
              loading={examsLoading}
            />
          </div>
        </GlassCard>

        {!examsLoading && !exams.length && (
          <GlassCard className="p-14 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-[#222] flex items-center justify-center text-3xl">
              📭
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-bold text-lg">
              {t("analysis.noExamsFound")}
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">
              {t("analysis.noExamsInstructor")}
            </p>
          </GlassCard>
        )}

        {/* VIOLATIONS TAB */}
        {activeTab === "violations" && (
          <GlassCard className="p-6">
            <SectionHeader
              icon={<AlertTriangle size={15} />}
              title={t("analysis.cheatingViolations")}
            />

            {!selectedExamId ? (
              <div className="flex flex-col items-center gap-3 py-14 text-center">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-[#222] flex items-center justify-center text-2xl">
                  📋
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {t("analysis.selectExamToSeeViolations")}
                </p>
              </div>
            ) : violationsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 rounded-2xl bg-slate-100 dark:bg-[#2a2a2e] animate-pulse"
                  />
                ))}
              </div>
            ) : violations.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-14 text-center">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-900/15 flex items-center justify-center">
                  <Inbox size={26} className="text-emerald-500" />
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-bold">
                  {t("analysis.noViolationsDetected")}
                </p>
                <p className="text-sm text-slate-400">
                 {t("analysis.allStudentsBehavedWell")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                  {violations.map((v: any) => {
                    const attemptId = v.examAttemptId;
                    

                    return (
                      <div key={v.id} className="rounded-2xl border border-slate-100 dark:border-[#2a2a2e] bg-white dark:bg-[#1A1A1A] overflow-hidden">
                        
                        {/* Main row */}
                        <div className="flex items-center justify-between gap-4 p-4">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 dark:text-white text-sm truncate">
                              {v.studentName ?? `Attempt #${attemptId}`}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                              <span className="flex items-center gap-1 text-red-500">
                                <AlertTriangle size={11} />
                                {v.severity} — {v.reason}
                              </span>
                              <span>{v.detectedAt ? new Date(v.detectedAt).toLocaleDateString() : ''}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Toggle image button */}
                            {v.frameImagePath && (
                              <button
                                onClick={() => setOpenImageId(prev => (prev === v.id ? null : v.id))}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#3a3a3e] text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-slate-50 dark:hover:bg-[#2a2a2e] transition-colors"
                              >
                                {openImageId === v.id ? 'Hide Image' : 'Show Image'}
                              </button>
                            )}
                            {attemptId != null ? (
                              <>
                                <button
                                  onClick={() => resolveMut.mutate({ attemptId, newScore: v.score ?? 0, notes: 'Reviewed and approved by instructor.' })}
                                  disabled={resolveMut.isPending}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors disabled:opacity-60"
                                >
                                  <CheckCircle2 size={13} /> Resolve (Pass)
                                </button>
                                <button
                                  onClick={() => flagMut.mutate({ attemptId, reason: v.reason ?? 'Cheating violation confirmed' })}
                                  disabled={flagMut.isPending}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 text-xs font-bold transition-colors disabled:opacity-60"
                                >
                                  <XCircle size={13} /> Flag (Fail)
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-slate-400 italic px-2">No linked attempt</span>
                            )}
                          </div>
                        </div>

                        {/* Dropdown image */}
                       {openImageId === v.id && v.frameImagePath && (
                          <div className="px-4 pb-4 border-t border-slate-100 dark:border-[#2a2a2e] pt-3">
                            <img
                              src={v.frameImagePath}
                              alt="Violation screenshot"
                              className="w-full max-h-64 object-contain rounded-xl border border-slate-200 dark:border-[#2a2a2e]"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </GlassCard>
        )}

        {/*  MY EXAMS TAB  */}
        {activeTab === "myExams" && selectedExamId && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {analyticsLoading || !statCards
                ? Array.from({ length: 4 }).map((_, i) => (
                    <GlassCard
                      key={i}
                      className="p-5 h-28 animate-pulse"
                      children={undefined}
                    />
                  ))
                : statCards.map((s) => <StatCard key={s.label} {...s} />)}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <GlassCard className="xl:col-span-2 p-6">
                <SectionHeader
                  icon={<BarChart3 size={15} />}
                  title={t("analysis.scoreDistribution")}
                />
                <ScoreDistChart data={distribution} loading={distLoading} />
              </GlassCard>
              <GlassCard className="p-6">
                <SectionHeader
                  icon={<Target size={15} />}
                  title={t("analysis.examSummary")}
                />
                <ExamSummaryCard
                  analytics={analytics}
                  loading={analyticsLoading}
                />
              </GlassCard>
            </div>

            {/* Publish Grades  */}
            <GlassCard className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      isPublished
                        ? "bg-emerald-50 dark:bg-emerald-900/15"
                        : "bg-amber-50 dark:bg-amber-500/10"
                    }`}
                  >
                    {isPublished ? (
                      <CheckCircle2 size={20} className="text-emerald-500" />
                    ) : (
                      <Send size={20} className="text-amber-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white text-sm">
                      {isPublished ? t("analysis.gradesPublished") : t("analysis.publishGrades")}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {isPublished ? t("analysis.gradesPublishedDesc") : t("analysis.publishGradesDesc")}   
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => publishMut.mutate()}
                  disabled={publishMut.isPending || isPublished}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all shrink-0 ${
                    isPublished
                      ? "bg-emerald-500 text-white cursor-default"
                      : "bg-[#0061EF] hover:bg-[#0052cc] text-white disabled:opacity-60"
                  }`}
                >
                  {publishMut.isPending ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />{" "}
                      {t("analysis.publishing")}
                    </>
                  ) : isPublished ? (
                    <>
                      <CheckCircle2 size={15} />
                      {isPublished ? <>{t("analysis.alreadyPublished")}</>: <>{t("analysis.published")}</>}
                    </>
                  ) : (
                    <>
                      <Send size={15} />  <>{t("analysis.publishGrades")}</>
                    </>
                  )}
                </button>
              </div>
            </GlassCard>

            {/* Attempts table */}
            <GlassCard className="p-6">
              <SectionHeader
                icon={<Users size={15} />}
                title={t("analysis.allStudentAttempts")}
                badge={
                  !attemptsLoading
                    ? `${attempts.length} ${t("analysis.total")}`
                    : undefined
                }
              />
              <AttemptsTable
                attempts={attempts}
                loading={attemptsLoading}
                showStudent={true}
                examId={selectedExamId}
              />
            </GlassCard>
          </>
        )}
      </div>
    </div>
  );
};
