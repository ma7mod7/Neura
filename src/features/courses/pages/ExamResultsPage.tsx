import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    CheckCircle2, XCircle, ArrowLeft, Clock,
    BarChart2, Target, Award, TrendingUp
} from 'lucide-react';
import { getAttemptResults, getExamAnalytics } from '../api/examApi';
import Footer from '../../../shared/components/Footer';

export default function ExamResultsPage() {
    const { examId, attemptId } = useParams<{ examId: string; attemptId: string }>();
    const navigate = useNavigate();

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
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0e0e10] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#0061EF] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!results) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0e0e10] flex items-center justify-center">
                <p className="text-slate-500 dark:text-[#d0d0E0]">Results not found.</p>
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
        return `${m}m ${s}s`;
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0e0e10] font-inter">

            {/* Header */}
            <div className="bg-white dark:bg-[#1A1A1A] border-b border-slate-200 dark:border-[#2a2a2e] sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-500 dark:text-[#d0d0E0] hover:text-slate-800 dark:hover:text-white transition-colors text-sm"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div className="h-4 w-px bg-slate-200 dark:bg-[#2a2a2e]" />
                    <h1 className="text-sm font-bold text-slate-800 dark:text-[#E0E0E0]">Quiz Results</h1>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-8">

                {/* Hero result card */}
                <div className={`rounded-2xl p-8 flex flex-col items-center text-center border ${passed
                    ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30'
                    : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'
                }`}>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${passed ? 'bg-green-100 dark:bg-green-500/20' : 'bg-red-100 dark:bg-red-500/20'}`}>
                        {passed
                            ? <CheckCircle2 size={40} className="text-green-500" />
                            : <XCircle size={40} className="text-red-500" />
                        }
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-[#E0E0E0] mb-1">
                        {passed ? 'You Passed!' : 'Not Passed'}
                    </h2>
                    <p className="text-slate-500 dark:text-[#d0d0E0] text-sm mb-6">
                        {passed ? 'Great job! You met the passing score.' : 'Keep studying and try again.'}
                    </p>

                    {/* Score circle */}
                    <div className={`w-32 h-32 rounded-full border-8 flex flex-col items-center justify-center ${passed ? 'border-green-400' : 'border-red-400'}`}>
                        <span className="text-4xl font-bold text-slate-800 dark:text-[#E0E0E0]">{score}%</span>
                        <span className="text-xs text-slate-500 dark:text-[#d0d0E0]">Score</span>
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        {
                            icon: <Target size={20} className="text-[#0061EF]" />,
                            label: 'Score',
                            value: `${score}%`,
                            bg: 'bg-blue-50 dark:bg-blue-500/10'
                        },
                        {
                            icon: <CheckCircle2 size={20} className="text-green-500" />,
                            label: 'Correct',
                            value: `${correctCount}/${totalCount}`,
                            bg: 'bg-green-50 dark:bg-green-500/10'
                        },
                        {
                            icon: <Award size={20} className="text-yellow-500" />,
                            label: 'Status',
                            value: passed ? 'Passed' : 'Failed',
                            bg: passed ? 'bg-green-50 dark:bg-green-500/10' : 'bg-red-50 dark:bg-red-500/10'
                        },
                        {
                            icon: <Clock size={20} className="text-purple-500" />,
                            label: 'Time taken',
                            value: timeTaken ? formatTime(timeTaken) : '—',
                            bg: 'bg-purple-50 dark:bg-purple-500/10'
                        },
                    ].map((stat, i) => (
                        <div key={i} className={`${stat.bg} rounded-2xl p-4 flex flex-col gap-2 border border-slate-100 dark:border-[#2a2a2e]`}>
                            <div className="flex items-center gap-2">
                                {stat.icon}
                                <span className="text-xs text-slate-500 dark:text-[#d0d0E0]">{stat.label}</span>
                            </div>
                            <span className="text-xl font-bold text-slate-800 dark:text-[#E0E0E0]">{stat.value}</span>
                        </div>
                    ))}
                </div>

                {/* Compared to average */}
                {analytics && (
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-slate-200 dark:border-[#2a2a2e] p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={18} className="text-[#0061EF]" />
                            <h3 className="font-bold text-slate-800 dark:text-[#E0E0E0]">Compared to others</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'Average score', value: `${Math.round(analytics.averageScore ?? 0)}%` },
                                { label: 'Highest score', value: `${Math.round(analytics.highestScore ?? 0)}%` },
                                { label: 'Pass rate', value: `${Math.round(analytics.passRate ?? 0)}%` },
                            ].map((item, i) => (
                                <div key={i} className="text-center p-4 bg-slate-50 dark:bg-[#0e0e10] rounded-xl">
                                    <p className="text-xs text-slate-400 dark:text-[#d0d0E0] mb-1">{item.label}</p>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-[#E0E0E0]">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Your score vs average bar */}
                        <div className="mt-6">
                            <div className="flex justify-between text-xs text-slate-500 dark:text-[#d0d0E0] mb-2">
                                <span>Your score</span>
                                <span>{score}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-[#2a2a2e] rounded-full mb-3">
                                <div className="h-full bg-[#0061EF] rounded-full" style={{ width: `${score}%` }} />
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 dark:text-[#d0d0E0] mb-2">
                                <span>Class average</span>
                                <span>{Math.round(analytics.averageScore ?? 0)}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-[#2a2a2e] rounded-full">
                                <div className="h-full bg-slate-400 dark:bg-[#4a4a4e] rounded-full" style={{ width: `${Math.round(analytics.averageScore ?? 0)}%` }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Per-question breakdown */}
                {Array.isArray(results.questions) && results.questions.length > 0 && (
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-slate-200 dark:border-[#2a2a2e] p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart2 size={18} className="text-[#0061EF]" />
                            <h3 className="font-bold text-slate-800 dark:text-[#E0E0E0]">Question breakdown</h3>
                        </div>
                        <div className="flex flex-col gap-4">
                            {results.questions.map((q: any, i: number) => (
                                <div
                                    key={q.questionId ?? i}
                                    className={`p-4 rounded-xl border ${q.isCorrect
                                        ? 'border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10'
                                        : 'border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${q.isCorrect ? 'bg-green-100 dark:bg-green-500/20' : 'bg-red-100 dark:bg-red-500/20'}`}>
                                            {q.isCorrect
                                                ? <CheckCircle2 size={14} className="text-green-500" />
                                                : <XCircle size={14} className="text-red-500" />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800 dark:text-[#E0E0E0] mb-2">
                                                <span className="text-slate-400 dark:text-[#d0d0E0] mr-1">Q{i + 1}.</span>
                                                {q.questionText}
                                            </p>
                                            <div className="flex flex-col gap-1">
                                                {q.yourAnswerText && (
                                                    <p className={`text-xs ${q.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                                        Your answer: {q.yourAnswerText}
                                                    </p>
                                                )}
                                                {!q.isCorrect && q.correctOptionText && (
                                                    <p className="text-xs text-green-600 dark:text-green-400">
                                                        Correct answer: {q.correctOptionText}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-lg shrink-0 ${q.isCorrect
                                            ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                                            : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                                        }`}>
                                            {q.isCorrect ? '+' : '0'}{q.points ?? 1} pt
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-center pb-8">
                    <button
                        onClick={() => navigate(-2)}
                        className="px-6 py-3 border border-slate-200 dark:border-[#2a2a2e] text-slate-600 dark:text-[#d0d0E0] rounded-xl hover:bg-slate-50 dark:hover:bg-[#2a2a2e] transition-colors font-medium text-sm"
                    >
                        Back to Course
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
}