import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    CheckCircle2, XCircle, ArrowLeft, Clock,
    BarChart2, Target, Award, TrendingUp, AlertCircle
} from 'lucide-react';
import { getAttemptResults, getExamAnalytics } from '../api/examApi';
import { useTranslation } from 'react-i18next';

export default function ExamResultsPage() {
    const { examId, attemptId } = useParams<{ examId: string; attemptId: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { data: results, isLoading: resultsLoading } = useQuery({
        queryKey: ['attemptResults', attemptId],
        queryFn: () => getAttemptResults(attemptId!),
        enabled: !!attemptId,
    });

    const { data: analytics } = useQuery({
        queryKey: ['examAnalytics', examId],
        queryFn: () => getExamAnalytics(examId!),
        enabled: !!examId,
    });

    if (resultsLoading) {
        return (
            <div className="h-screen bg-[#F8FAFC] dark:bg-[#0e0e10] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#0061EF] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!results) {
        return (
            <div className="h-screen bg-[#F8FAFC] dark:bg-[#0e0e10] flex flex-col items-center justify-center gap-4">
                <AlertCircle size={48} className="text-slate-400" />
                <p className="text-slate-500 dark:text-[#d0d0E0] font-medium">{t('examResults.couldNotLoad')}</p>
                <button onClick={() => navigate(-1)} className="text-[#0061EF] font-semibold hover:underline">{t('examResults.goBack')}</button>
            </div>
        );
    }

    const passed = results.isPassed ?? results.passed;
    const score = Math.round(results.scorePercentage ?? results.score ?? 0);
    const correctCount = results.questions?.filter((q: any) => q.isCorrect).length ?? 0;
    const totalCount = results.questions?.length ?? 0;
    const timeTaken = results.timeTakenInSeconds ?? results.durationSeconds ?? null;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${t('courseDetails.minutes', { count: m })} ${t('courseDetails.seconds', { count: s })}`;
    };

    return (
        // استخدام h-screen لمنع السكرول الخارجي
        <div className="h-screen bg-[#F8FAFC] dark:bg-[#0e0e10] font-inter flex flex-col overflow-hidden">
            
            {/* Header - Fixed at top */}
            <div className="bg-white dark:bg-[#1A1A1A] border-b border-slate-200 dark:border-[#2a2a2e] shrink-0 z-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-3.5 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-500 dark:text-[#d0d0E0] hover:text-[#0061EF] transition-colors text-sm font-semibold"
                    >
                        <ArrowLeft size={18} className="rtl:rotate-180" /> {t('examResults.backToCourse')}
                    </button>
                    <div className="h-5 w-px bg-slate-200 dark:bg-[#2a2a2e]" />
                    <h1 className="text-base font-bold text-slate-800 dark:text-[#E0E0E0]">{t('examResults.title')}</h1>
                </div>
            </div>

            {/* Main Content - Split View on Desktop */}
            <main className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-6 p-4 md:p-6 overflow-hidden">
                
                {/* Left Column: Overview & Analytics (Scrollable internally if needed) */}
                <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 flex flex-col gap-5 overflow-y-auto pe-1 pb-8 custom-scrollbar">
                    
                    {/* Hero result card */}
                    <div className={`relative overflow-hidden rounded-3xl p-6 flex flex-col items-center text-center border shadow-sm shrink-0 ${passed
                        ? 'bg-gradient-to-b from-green-50 to-white dark:from-green-900/20 dark:to-[#1A1A1A] border-green-200 dark:border-green-500/30'
                        : 'bg-gradient-to-b from-red-50 to-white dark:from-red-900/20 dark:to-[#1A1A1A] border-red-200 dark:border-red-500/30'
                        }`}>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-[#E0E0E0] mb-4 tracking-tight">
                            {passed ? t('examResults.passedTitle') : t('examResults.failedTitle')}
                        </h2>
                        
                        {/* Circular Score (Compact) */}
                        <div className="relative flex items-center justify-center mb-2">
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle cx="64" cy="64" r="56" className="stroke-current text-slate-200 dark:text-[#2a2a2e]" strokeWidth="10" fill="transparent" />
                                <circle cx="64" cy="64" r="56" className={`stroke-current ${passed ? 'text-green-500' : 'text-red-500'}`} strokeWidth="10" fill="transparent" strokeDasharray="351.8" strokeDashoffset={351.8 - (351.8 * score) / 100} strokeLinecap="round" />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-3xl font-black text-slate-800 dark:text-[#E0E0E0]">{score}%</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('examResults.score')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 shrink-0">
                        {[
                            { icon: <CheckCircle2 size={18} />, label: t('examResults.correct'), value: `${correctCount}/${totalCount}`, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' },
                            { icon: <Target size={18} />, label: t('examResults.score'), value: `${score}%`, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                            { icon: <Award size={18} />, label: t('examResults.status'), value: passed ? t('examResults.passed') : t('examResults.failed'), color: passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400', bg: passed ? 'bg-green-50 dark:bg-green-500/10' : 'bg-red-50 dark:bg-red-500/10' },
                            { icon: <Clock size={18} />, label: t('examResults.time'), value: timeTaken ? formatTime(timeTaken) : '—', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-4 border border-slate-200 dark:border-[#2a2a2e] shadow-sm flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium text-slate-500 dark:text-[#d0d0E0] uppercase">{stat.label}</p>
                                    <p className="text-lg font-bold text-slate-800 dark:text-[#E0E0E0] leading-tight">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Analytics */}
                    {analytics && (
                        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-slate-200 dark:border-[#2a2a2e] p-5 shadow-sm shrink-0">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp size={18} className="text-[#0061EF]" />
                                <h3 className="font-bold text-sm text-slate-800 dark:text-[#E0E0E0]">{t('examResults.performanceInsights')}</h3>
                            </div>
                            
                            <div className="flex flex-col gap-4">
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1.5">
                                        <span className="text-slate-700 dark:text-[#E0E0E0]">{t('examResults.yourScore')}</span>
                                        <span className="text-[#0061EF]">{score}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-[#2a2a2e] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#0061EF] rounded-full" style={{ width: `${score}%` }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1.5">
                                        <span className="text-slate-500 dark:text-[#d0d0E0]">{t('examResults.classAverage')}</span>
                                        <span className="text-slate-500 dark:text-[#d0d0E0]">{Math.round(analytics.averageScore ?? 0)}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-[#2a2a2e] rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-400 dark:bg-[#4a4a4e] rounded-full" style={{ width: `${Math.round(analytics.averageScore ?? 0)}%` }} />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    <div className="text-center p-3 bg-slate-50 dark:bg-[#0e0e10] rounded-xl border border-slate-100 dark:border-[#2a2a2e]">
                                        <p className="text-[10px] font-semibold text-slate-500 uppercase">{t('examResults.highestScore')}</p>
                                        <p className="text-lg font-bold text-slate-800 dark:text-[#E0E0E0]">{Math.round(analytics.highestScore ?? 0)}%</p>
                                    </div>
                                    <div className="text-center p-3 bg-slate-50 dark:bg-[#0e0e10] rounded-xl border border-slate-100 dark:border-[#2a2a2e]">
                                        <p className="text-[10px] font-semibold text-slate-500 uppercase">{t('examResults.passRate')}</p>
                                        <p className="text-lg font-bold text-slate-800 dark:text-[#E0E0E0]">{Math.round(analytics.passRate ?? 0)}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Detailed Breakdown (Independently Scrollable) */}
                {Array.isArray(results.questions) && results.questions.length > 0 && (
                    <div className="flex-1 flex flex-col bg-white dark:bg-[#1A1A1A] rounded-3xl border border-slate-200 dark:border-[#2a2a2e] shadow-sm overflow-hidden">
                        
                        {/* Breakdown Header */}
                        <div className="p-5 border-b border-slate-100 dark:border-[#2a2a2e] bg-slate-50/50 dark:bg-[#111111] shrink-0 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                                    <BarChart2 size={18} className="text-[#0061EF]" />
                                </div>
                                <h3 className="font-bold text-base text-slate-800 dark:text-[#E0E0E0]">{t('examResults.breakdown')}</h3>
                            </div>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-200 dark:bg-[#2a2a2e] px-2.5 py-1 rounded-full">
                                {t('examResults.questions', { count: totalCount })}
                            </span>
                        </div>
                        
                        {/* Questions List (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 custom-scrollbar">
                            {results.questions.map((q: any, i: number) => {
                                const correctAnswersText = q.options
                                    ?.filter((opt: any) => opt.isCorrect)
                                    ?.map((opt: any) => opt.text)
                                    ?.join(' , ');

                               const userAnswerText = q.options
                                    ?.filter((opt: any) => opt.wasSelected)
                                    ?.map((opt: any) => opt.text)
                                    ?.join(' , ');
                                return (
                                    <div key={q.questionId ?? i} className={`p-4 md:p-5 rounded-2xl border-2 transition-colors hover:shadow-md ${q.isCorrect ? 'border-green-100 dark:border-green-500/20 bg-green-50/30 dark:bg-green-500/5' : 'border-red-100 dark:border-red-500/20 bg-red-50/30 dark:bg-red-500/5'}`}>
                                        <div className="flex items-start gap-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${q.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {q.isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('examResults.question', { number: i + 1 })}</span>
                                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${q.isCorrect ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                                                        {q.isCorrect
                                                            ? `+${t('examResults.pointsShort', { points: q.points ?? 1 })}`
                                                            : t('examResults.pointsShort', { points: 0 })}
                                                    </span>
                                                </div>
                                                <p className="text-sm md:text-base font-semibold text-slate-800 dark:text-[#E0E0E0] mb-4 leading-relaxed">
                                                    {q.questionText}
                                                </p>

                                                <div className="grid md:grid-cols-2 gap-3">
                                                    {/* Your Answer */}
                                                    <div className="p-3 rounded-xl bg-white dark:bg-[#1A1A1A] border border-slate-100 dark:border-[#2a2a2e] shadow-sm">
                                                        <span className="text-[11px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">{t('examResults.yourAnswer')}</span>
                                                        <span className={`text-sm font-semibold ${q.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                                            {userAnswerText || t('examResults.noAnswer')}
                                                        </span>
                                                    </div>

                                                    {/* Correct Answer (Only if wrong) */}
                                                    {!q.isCorrect && correctAnswersText && (
                                                        <div className="p-3 rounded-xl bg-white dark:bg-[#1A1A1A] border border-green-100 dark:border-green-500/30 shadow-sm">
                                                            <span className="text-[11px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">{t('examResults.correctAnswer')}</span>
                                                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                                {correctAnswersText}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>

            {/* ستايل بسيط لتحسين شكل الـ Scrollbar ليتناسب مع التصميم */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #CBD5E1; /* slate-300 */
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #475569; /* slate-600 */
                }
            `}</style>
        </div>
    );
}
