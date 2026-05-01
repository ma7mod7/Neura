import { useEffect, useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Loader2, BarChart2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    getExamByLesson,
    startExamAttempt,
    saveAnswer,
    submitAttempt,
    getAttemptResults,
    getExamInfo, // ⭐ هنستخدم ده عشان نشوف لو في Attempt شغال
    resumeAttempt
} from '../../api/examApi';
import toast from 'react-hot-toast';

interface QuizLessonProps {
    lessonId: string;
    lessonTitle: string;
}

export default function QuizLesson({ lessonId, lessonTitle }: QuizLessonProps) {
    const navigate = useNavigate();
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [results, setResults] = useState<any | null>(null);
    const [started, setStarted] = useState(false);
    
    // ⭐ تنظيف الـ State عند تغيير الدرس عشان مايحتفظش بأسئلة الدرس القديم
    useEffect(() => {
        setAttemptId(null);
        setQuestions([]);
        setSelectedAnswers({});
        setSubmitted(false);
        setResults(null);
        setStarted(false);
    }, [lessonId]);

    const { data: exam, isLoading: examLoading, isError: examError } = useQuery({
        queryKey: ['examByLesson', lessonId],
        queryFn: () => getExamByLesson(lessonId),
        enabled: !!lessonId,
    });

    // ⭐ جلب معلومات الـ Exam للمستخدم الحالي (للتأكد لو في Attempt شغال)
    const { data: examInfo, isLoading: infoLoading } = useQuery({
        queryKey: ['examInfo', lessonId],
        queryFn: () => getExamInfo(lessonId),
        enabled: !!lessonId,
    });

    // ⭐ استرجاع الأسئلة لو كان فيه Attempt شغال
    useEffect(() => {
        const fetchResumeData = async () => {
            if (examInfo?.hasActiveAttempt && examInfo.activeAttemptId) {
                try {
                    const resumeData = await resumeAttempt(examInfo.activeAttemptId);
                    setAttemptId(String(examInfo.activeAttemptId));
                    setQuestions(resumeData.questions ?? []);
                    
                    // استرجاع الإجابات السابقة
                    const previousAnswers: Record<string, string> = {};
                    if (resumeData.questions) {
                        resumeData.questions.forEach((q: any) => {
                            if (q.selectedOptionId) {
                                previousAnswers[String(q.id ?? q.questionId)] = String(q.selectedOptionId);
                            }
                        });
                    }
                    setSelectedAnswers(previousAnswers);
                    setStarted(true);
                } catch (error) {
                    console.error("Failed to resume attempt", error);
                }
            }
        };

        fetchResumeData();
    }, [examInfo]);

    const { mutate: startExam, isPending: isStarting } = useMutation({
        mutationFn: () => startExamAttempt(lessonId), // ⭐ استخدم lessonId مباشرة
        onSuccess: (data) => {
            setAttemptId(String(data.attemptId ?? data.id));
            setQuestions(data.questions ?? []);
            setStarted(true);
        },
        onError: (error: any) => {
             console.error("Error starting exam:", error);
             toast.error("Failed to start the quiz.");
        }
    });

    const { mutate: handleSubmit, isPending: isSubmitting } = useMutation({
        mutationFn: () => submitAttempt(attemptId!),
        onSuccess: async () => {
            try {
                const res = await getAttemptResults(attemptId!);
                setResults(res);
                setSubmitted(true);
            } catch (error) {
                toast.error("Failed to fetch results.");
            }
        },
        onError: () => {
             toast.error("Failed to submit quiz.");
        }
    });

    const handleSelectOption = async (questionId: string, optionId: string) => {
        setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
        if (attemptId) {
            try {
                await saveAnswer(attemptId, questionId, optionId);
            } catch (error) {
                // Revert UI on failure
                console.error("Failed to save answer", error);
                toast.error("Failed to save answer. Check connection.");
            }
        }
    };

    if (examLoading || infoLoading) {
        return (
            <div className="w-full flex items-center justify-center bg-white dark:bg-[#1A1A1A]" style={{ minHeight: '420px' }}>
                <Loader2 size={40} className="animate-spin text-[#0061EF]" />
            </div>
        );
    }

    if (examError || !exam) {
        return (
            <div className="w-full flex flex-col items-center justify-center bg-white dark:bg-[#1A1A1A]" style={{ minHeight: '420px' }}>
                <HelpCircle size={48} className="text-gray-300 dark:text-[#2a2a2e] mb-3" />
                <p className="text-gray-400 dark:text-[#d0d0E0] text-sm">No quiz available for this lesson.</p>
            </div>
        );
    }

    const answeredCount = Object.keys(selectedAnswers).length;
    const totalQuestions = questions.length;

    // ====== Start screen ======
    if (!started) {
        return (
            <div className="w-full bg-white dark:bg-[#1A1A1A] flex flex-col items-center justify-center px-6 py-16" style={{ minHeight: '420px' }}>
                <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6">
                    <HelpCircle size={40} className="text-[#0061EF]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-[#E0E0E0] mb-2 text-center">{lessonTitle}</h2>
                {exam.description && (
                    <p className="text-slate-500 dark:text-[#d0d0E0] text-sm text-center max-w-md mb-6">{exam.description}</p>
                )}
                <div className="flex flex-wrap gap-4 mb-8 justify-center">
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#2a2a2e] rounded-xl px-4 py-2">
                        <HelpCircle size={14} className="text-[#0061EF]" />
                        <span className="text-sm text-slate-600 dark:text-[#d0d0E0]">{exam.questionsCount || exam.totalQuestions || 0} Questions</span>
                    </div>
                    {exam.durationInMinutes && (
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#2a2a2e] rounded-xl px-4 py-2">
                            <span className="text-sm text-slate-600 dark:text-[#d0d0E0]">{exam.durationInMinutes} min</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => startExam()}
                    disabled={isStarting}
                    className="px-10 py-3 bg-[#0061EF] hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-60 shadow-lg shadow-blue-200 dark:shadow-none"
                >
                    {isStarting ? 'Starting...' : 'Start Quiz'}
                </button>
            </div>
        );
    }

    // ====== Results screen ======
    if (submitted && results) {
        const passed = results.isPassed ?? results.passed;
        const score = results.scorePercentage ?? results.score ?? 0;
        const examId = exam?.id ?? exam?.examId;

        return (
            <div className="w-full bg-white dark:bg-[#1A1A1A] px-6 py-10 flex flex-col items-center" style={{ minHeight: '420px' }}>
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${passed ? 'bg-green-100 dark:bg-green-500/20' : 'bg-red-100 dark:bg-red-500/20'}`}>
                    {passed
                        ? <CheckCircle2 size={48} className="text-green-500" />
                        : <XCircle size={48} className="text-red-500" />
                    }
                </div>

                <h2 className="text-2xl font-bold text-slate-800 dark:text-[#E0E0E0] mb-1">
                    {passed ? 'Congratulations!' : 'Keep Practicing!'}
                </h2>
                <p className="text-slate-500 dark:text-[#d0d0E0] text-sm mb-6">
                    {passed ? 'You passed the quiz.' : 'You did not reach the passing score.'}
                </p>

                <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center mb-6 ${passed ? 'border-green-400' : 'border-red-400'}`}>
                    <span className="text-3xl font-bold text-slate-800 dark:text-[#E0E0E0]">{Math.round(score)}%</span>
                    <span className="text-xs text-slate-400 dark:text-[#d0d0E0]">Score</span>
                </div>

                {/* Quick breakdown */}
                {Array.isArray(results.questions) && (
                    <div className="w-full max-w-xl space-y-3 mb-8">
                        {results.questions.map((q: any, i: number) => (
                            <div key={q.questionId ?? i} className={`p-4 rounded-xl border ${q.isCorrect
                                ? 'border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10'
                                : 'border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10'
                                }`}>
                                <div className="flex items-start gap-2">
                                    {q.isCorrect
                                        ? <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                                        : <XCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                    }
                                    <div>
                                        <p className="text-sm font-medium text-slate-800 dark:text-[#E0E0E0]">{q.questionText}</p>
                                        {!q.isCorrect && q.correctOptionText && (
                                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                Correct: {q.correctOptionText}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setStarted(false);
                            setSubmitted(false);
                            setResults(null);
                            setAttemptId(null);
                            setSelectedAnswers({});
                            setQuestions([]);
                        }}
                        className="px-6 py-2.5 border border-slate-300 dark:border-[#2a2a2e] text-slate-600 dark:text-[#d0d0E0] font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-[#2a2a2e] transition-colors text-sm"
                    >
                        Retake Quiz
                    </button>
                    {examId && attemptId && (
                        <button
                            onClick={() => navigate(`/exam/${lessonId}/results/${attemptId}`)}
                            className="px-6 py-2.5 bg-[#0061EF] hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm flex items-center gap-2"
                        >
                            <BarChart2 size={16} /> View Full Analytics
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ====== Active Quiz ======
    return (
        <div className="w-full bg-white dark:bg-[#1A1A1A] px-4 py-6">
            <div className="flex items-center justify-between mb-4 max-w-2xl mx-auto">
                <div className="flex items-center gap-2">
                    <HelpCircle size={20} className="text-[#0061EF]" />
                    <h2 className="font-bold text-slate-800 dark:text-[#E0E0E0]">{lessonTitle}</h2>
                </div>
                <span className="text-sm text-slate-500 dark:text-[#d0d0E0]">
                    {answeredCount}/{totalQuestions} answered
                </span>
            </div>

            <div className="w-full max-w-2xl mx-auto h-1.5 bg-slate-200 dark:bg-[#2a2a2e] rounded-full mb-8">
                <div
                    className="h-full bg-[#0061EF] rounded-full transition-all duration-300"
                    style={{ width: totalQuestions > 0 ? `${(answeredCount / totalQuestions) * 100}%` : '0%' }}
                />
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
                {questions.map((question: any, qIndex: number) => {
                    const qId = String(question.id ?? question.questionId);
                    const selected = selectedAnswers[qId];

                    return (
                        <div key={qId} className="bg-slate-50 dark:bg-[#0e0e10] rounded-xl p-5 border border-slate-200 dark:border-[#2a2a2e]">
                            <p className="font-semibold text-slate-800 dark:text-[#E0E0E0] mb-4 text-sm leading-relaxed">
                                <span className="text-[#0061EF] mr-2 font-bold">{qIndex + 1}.</span>
                                {question.text ?? question.questionText}
                            </p>
                            <div className="space-y-2">
                                {(question.options ?? question.answerOptions ?? []).map((option: any) => {
                                    const optId = String(option.id ?? option.optionId);
                                    const isSelected = selected === optId;
                                    return (
                                        <button
                                            key={optId}
                                            onClick={() => handleSelectOption(qId, optId)}
                                            className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${isSelected
                                                ? 'border-[#0061EF] bg-blue-50 dark:bg-blue-500/10 text-[#0061EF] dark:text-blue-300 font-medium'
                                                : 'border-slate-200 dark:border-[#2a2a2e] bg-white dark:bg-[#1A1A1A] text-slate-700 dark:text-[#d0d0E0] hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-500/5'
                                                }`}
                                        >
                                            {option.text ?? option.optionText}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="max-w-2xl mx-auto mt-8 flex justify-end">
                <button
                    onClick={() => handleSubmit()}
                    disabled={isSubmitting || answeredCount === 0}
                    className={`px-8 py-3 rounded-xl font-bold text-white transition-colors text-sm ${isSubmitting || answeredCount === 0
                        ? 'bg-slate-300 dark:bg-[#2a2a2e] cursor-not-allowed'
                        : 'bg-[#0061EF] hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none'
                        }`}
                >
                    {isSubmitting ? 'Submitting...' : `Submit Quiz (${answeredCount}/${totalQuestions})`}
                </button>
            </div>
        </div>
    );
}