import { useEffect, useState } from 'react';
import { HelpCircle, Loader2, CheckCircle2, Clock, AlertCircle, Shield, Camera, ClipboardX, Eye, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    startExamAttempt,
    saveAnswer,
    submitAttempt,
    getExamInfo,
    resumeAttempt
} from '../../api/examApi';
import toast from 'react-hot-toast';
import { useProctoring } from '../../../dashboard/hooks/useProctoring';
import { useExamSecurity } from '../../hooks/useExamSecurity';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface QuizLessonProps {
    lessonId: string;
    lessonTitle: string;
}

const formatTimeLeft = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function QuizLesson({ lessonId, lessonTitle }: QuizLessonProps) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
    const [started, setStarted] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [acceptedRules, setAcceptedRules] = useState(false);
    const {user}=useAuth()
    
    // Timer States
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);

    useEffect(() => {
        setAttemptId(null);
        setQuestions([]);
        setSelectedAnswers({});
        setStarted(false);
        setIsRedirecting(false);
        setShowInstructions(false);
        setAcceptedRules(false);
        setTimeLeft(null);
        setEndTime(null);
    }, [lessonId]);

    const { data: examInfo, isLoading: infoLoading, error: infoError } = useQuery({
        queryKey: ['examInfo', lessonId],
        queryFn: () => getExamInfo(lessonId),
        enabled: !!lessonId,
        retry: false,
    });

    const clearLocalTimer = (id: string) => {
        localStorage.removeItem(`exam_${id}_end`);
    };

    // Resume Logic
    useEffect(() => {
        const fetchResumeData = async () => {
            if (examInfo?.hasInProgressAttempt && examInfo.inProgressAttemptId) {
                try {
                    const resumeData = await resumeAttempt(String(examInfo.inProgressAttemptId));
                    const currentAttemptId = String(examInfo.inProgressAttemptId);
                    setAttemptId(currentAttemptId);
                    setQuestions(resumeData.questions ?? []);

                    const previousAnswers: Record<string, string> = {};
                    if (resumeData.questions) {
                        resumeData.questions.forEach((q: any) => {
                            if (q.selectedOptionId) {
                                previousAnswers[String(q.id ?? q.questionId)] = String(q.selectedOptionId);
                            }
                        });
                    }
                    setSelectedAnswers(previousAnswers);
                    
                    // --- Timer Resume Logic ---
                    if (examInfo.durationInMinutes) {
                        const savedEndTime = localStorage.getItem(`exam_${currentAttemptId}_end`);
                        
                        if (savedEndTime) {
                            setEndTime(parseInt(savedEndTime, 10));
                        } else {
                            if (resumeData.startTime || resumeData.createdAt) {
                                const startMs = new Date(resumeData.startTime || resumeData.createdAt).getTime();
                                const calculatedEnd = startMs + (examInfo.durationInMinutes * 60 * 1000);
                                localStorage.setItem(`exam_${currentAttemptId}_end`, calculatedEnd.toString());
                                setEndTime(calculatedEnd);
                            } else {
                                const fallbackEnd = Date.now() + (examInfo.durationInMinutes * 60 * 1000);
                                localStorage.setItem(`exam_${currentAttemptId}_end`, fallbackEnd.toString());
                                setEndTime(fallbackEnd);
                            }
                        }
                    }
                    
                    setStarted(true);
                } catch (error) {
                    console.error("Failed to resume attempt", error);
                }
            }
        };
        fetchResumeData();
    }, [examInfo]);

    const { mutate: startExam, isPending: isStarting } = useMutation({
        mutationFn: () => startExamAttempt(lessonId),
        onSuccess: (data) => {
            const newAttemptId = String(data.attemptId ?? data.id);
            setAttemptId(newAttemptId);
            setQuestions(data.questions ?? []);
            
            // --- Timer Start Logic ---
            if (examInfo?.durationInMinutes) {
                const end = Date.now() + (examInfo.durationInMinutes * 60 * 1000);
                localStorage.setItem(`exam_${newAttemptId}_end`, end.toString());
                setEndTime(end);
            }
            
            setStarted(true);
        },
        onError: (error: any) => {
            const data = error.response?.data;
            if (Array.isArray(data)) {
                toast.error(data[1] || data[0]);
            } else if (data?.errors && Array.isArray(data.errors)) {
                toast.error(data.errors[1] || data.errors[0]);
            } else if (typeof data === 'string') {
                toast.error(data);
            } else {
                toast.error(t('quiz.maxAttemptsToast'));
            }
        }
    });

    const { mutate: submitExamMutation, isPending: isSubmitting } = useMutation({
        mutationFn: () => submitAttempt(attemptId!),
        onMutate: () => setIsRedirecting(true),
        onSuccess: () => {
            if (attemptId) clearLocalTimer(attemptId);
            toast.success(t('quiz.submittedToast'));
            navigate(`/exam/${lessonId}/results/${attemptId}`);
        },
        onError: (error: any) => {
            const errorData = error.response?.data;
            if (error.response?.status === 400 && JSON.stringify(errorData).toLowerCase().includes('submitted')) {
                if (attemptId) clearLocalTimer(attemptId);
                navigate(`/exam/${lessonId}/results/${attemptId}`);
            } else {
                setIsRedirecting(false);
                toast.error(t('quiz.submitFailedToast'));
            }
        }
    });

    // ⭐ تم نقل useProctoring هنا لكي يرى isSubmitting بشكل سليم
    useProctoring({
        isActive: started && !isSubmitting, 
        attemptId: attemptId,
        wsUrl: `wss://neura-lms-proctor-vision-api.hf.space/ws/proctor/${lessonId}/${user?.id}`, 
        intervalMs: 3000 
    });

    // ⭐ Anti-cheating: copy/paste prevention + tab switch detection (warn only, no auto-submit)
    const { violationCount, examContainerRef } = useExamSecurity({
        isActive: started && !isSubmitting && !isRedirecting,
        attemptId: attemptId,
    });

    // --- Absolute Timer Tick Logic ---
    useEffect(() => {
        if (!started || !endTime || isSubmitting || isRedirecting) return;

        const calculateAndCheckTime = () => {
            const remainingSeconds = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
            setTimeLeft(remainingSeconds);

            if (remainingSeconds <= 0) {
                toast.error(t('quiz.timeUpToast'));
                submitExamMutation();
            }
        };

        // حساب الوقت المتبقي فوراً عند التحميل
        calculateAndCheckTime(); 
        
        // ثم كل ثانية
        const timerId = setInterval(calculateAndCheckTime, 1000);

        return () => clearInterval(timerId);
    }, [started, endTime, isSubmitting, isRedirecting, submitExamMutation]);


    const handleSelectOption = async (questionId: string, optionId: string) => {
        setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
        if (attemptId) {
            try { 
                await saveAnswer(attemptId, questionId, optionId); 
            }
            catch (error) { toast.error(t('quiz.saveFailedToast')); }
        }
    };

    if (infoLoading) {
        return (
            <div className="w-full flex items-center justify-center bg-white dark:bg-[#1A1A1A]" style={{ minHeight: '420px' }}>
                <Loader2 size={40} className="animate-spin text-[#0061EF]" />
            </div>
        );
    }

    if ((infoError as any)?.response?.status === 404) {
        return (
            <div className="w-full flex flex-col items-center justify-center bg-white dark:bg-[#1A1A1A]" style={{ minHeight: '420px' }}>
                <AlertCircle size={48} className="text-gray-300 dark:text-[#2a2a2e] mb-3" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-[#E0E0E0] mb-2">{t('quiz.notFound')}</h2>
                <p className="text-slate-400 dark:text-[#d0d0E0] text-sm text-center max-w-sm px-4">{t('quiz.noContent')}</p>
            </div>
        );
    }

    if (!started && showInstructions) {
        // ── Instructions Modal ──────────────────────────────────────────
        const rules = [
            { icon: <Camera size={20} className="text-blue-500" />, title: t('quiz.cameraRequired'), desc: t('quiz.cameraRequiredDesc') },
            { icon: <ClipboardX size={20} className="text-red-500" />, title: t('quiz.noCopyPaste'), desc: t('quiz.noCopyPasteDesc') },
            { icon: <Eye size={20} className="text-amber-500" />, title: t('quiz.tabSwitching'), desc: t('quiz.tabSwitchingDesc') },
            { icon: <AlertTriangle size={20} className="text-orange-500" />, title: t('quiz.violationsTracked'), desc: t('quiz.violationsTrackedDesc') },
            { icon: <Shield size={20} className="text-green-500" />, title: t('quiz.instructorReview'), desc: t('quiz.instructorReviewDesc') },
        ];

        return (
            <div className="w-full bg-white dark:bg-[#1A1A1A] flex flex-col items-center justify-center px-6 py-12" style={{ minHeight: '420px' }}>
                <div className="w-full max-w-lg">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                            <Shield size={24} className="text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-[#E0E0E0]">{t('quiz.rulesTitle')}</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('quiz.rulesSubtitle')}</p>
                        </div>
                    </div>

                    {/* Duration badge */}
                    {examInfo?.durationInMinutes && (
                        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl px-4 py-3 mb-5">
                            <Clock size={18} className="text-[#0061EF]" />
                            <span className="text-sm font-semibold text-[#0061EF]">{t('quiz.timeLimit', { count: examInfo.durationInMinutes })}</span>
                        </div>
                    )}

                    {/* Rules list */}
                    <div className="space-y-3 mb-6">
                        {rules.map((rule, i) => (
                            <div key={i} className="flex items-start gap-3 bg-slate-50 dark:bg-[#0e0e10] border border-slate-100 dark:border-[#2a2a2e] rounded-xl px-4 py-3">
                                <div className="mt-0.5 shrink-0">{rule.icon}</div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-[#E0E0E0]">{rule.title}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{rule.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Acceptance checkbox */}
                    <label className="flex items-start gap-3 cursor-pointer mb-5 bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl px-4 py-3">
                        <input
                            type="checkbox"
                            checked={acceptedRules}
                            onChange={(e) => setAcceptedRules(e.target.checked)}
                            className="mt-0.5 w-4 h-4 accent-[#0061EF] cursor-pointer"
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t('quiz.acceptRules')}
                        </span>
                    </label>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => { setShowInstructions(false); setAcceptedRules(false); }}
                            className="flex-1 px-6 py-3.5 border border-slate-200 dark:border-[#2a2a2e] text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-[#2a2a2e] transition-all"
                        >
                            {t('quiz.goBack')}
                        </button>
                        <button
                            onClick={() => startExam()}
                            disabled={!acceptedRules || isStarting}
                            className={`flex-1 px-6 py-3.5 font-bold rounded-xl text-white transition-all ${
                                !acceptedRules || isStarting
                                    ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                                    : 'bg-[#0061EF] hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-500/25'
                            }`}
                        >
                            {isStarting ? t('quiz.starting') : t('quiz.startExam')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!started) {
        const max = examInfo?.maxAttempts ? Number(examInfo.maxAttempts) : null;
        const taken = Number(examInfo?.attemptsTaken || 0);
        const hasReachedMax = max !== null && max > 0 && taken >= max;

        return (
            <div className="w-full bg-white dark:bg-[#1A1A1A] flex flex-col items-center justify-center px-6 py-16" style={{ minHeight: '420px' }}>
                <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6 shadow-inner">
                    <HelpCircle size={40} className="text-[#0061EF]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-[#E0E0E0] mb-3 text-center">{examInfo?.title || lessonTitle}</h2>
                
                <div className="flex flex-wrap gap-3 mb-8 justify-center">
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#2a2a2e] border border-slate-100 dark:border-[#3a3a3e] rounded-xl px-4 py-2.5">
                        <HelpCircle size={16} className="text-[#0061EF]" />
                        <span className="text-sm font-medium text-slate-600 dark:text-[#d0d0E0]">{t('quiz.questions', { count: examInfo?.questionCount || 0 })}</span>
                    </div>
                    {examInfo?.durationInMinutes && (
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#2a2a2e] border border-slate-100 dark:border-[#3a3a3e] rounded-xl px-4 py-2.5">
                            <Clock size={16} className="text-purple-500" />
                            <span className="text-sm font-medium text-slate-600 dark:text-[#d0d0E0]">{t('quiz.minutes', { count: examInfo.durationInMinutes })}</span>
                        </div>
                    )}
                    {max !== null && (
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#2a2a2e] border border-slate-100 dark:border-[#3a3a3e] rounded-xl px-4 py-2.5">
                            <CheckCircle2 size={16} className="text-green-500" />
                            <span className="text-sm font-medium text-slate-600 dark:text-[#d0d0E0]">{t('quiz.attempts', { taken, max })}</span>
                        </div>
                    )}
                </div>

                {hasReachedMax ? (
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 w-full max-w-md text-center">
                        <p className="text-red-600 dark:text-red-400 font-medium text-sm">
                            {t('quiz.maxAttemptsReached')}
                        </p>
                    </div>
                ) : (
                    <button onClick={() => setShowInstructions(true)} disabled={isStarting} className="px-10 py-3.5 bg-[#0061EF] text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-blue-500/25">
                        {isStarting ? t('quiz.starting') : (examInfo?.hasInProgressAttempt ? t('quiz.resumeQuiz') : t('quiz.startQuiz'))}
                    </button>
                )}
            </div>
        );
    }

    const answeredCount = Object.keys(selectedAnswers).length;
    const totalQuestions = questions.length;
    const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

    return (
        <div ref={examContainerRef} className="w-full bg-white dark:bg-[#1A1A1A] px-4 py-8" style={{ userSelect: 'none' }}>
            <div className="max-w-3xl mx-auto mb-8 bg-slate-50 dark:bg-[#0e0e10] border border-slate-200 dark:border-[#2a2a2e] rounded-2xl p-5 sticky top-4 z-10 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                    <h3 className="font-bold text-slate-800 dark:text-[#E0E0E0]">{examInfo?.title || lessonTitle}</h3>
                    
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                        {timeLeft !== null && (
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${timeLeft < 60 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse' : 'bg-slate-200 text-slate-700 dark:bg-[#3a3a3e] dark:text-[#E0E0E0]'}`}>
                                <Clock size={16} />
                                <span>{formatTimeLeft(timeLeft)}</span>
                            </div>
                        )}
                        <span className="text-sm font-bold text-[#0061EF] bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-full">
                            {t('quiz.answered', { answered: answeredCount, total: totalQuestions })}
                        </span>
                        {violationCount > 0 && (
                            <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-2.5 py-1.5 rounded-full flex items-center gap-1">
                                <AlertTriangle size={12} />
                                {violationCount}/3
                            </span>
                        )}
                    </div>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-[#2a2a2e] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0061EF] rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }} />
                </div>
            </div>

            <div className="max-w-3xl mx-auto space-y-8">
                {questions.map((question: any, qIndex: number) => {
                    const qId = String(question.id ?? question.questionId);
                    const selected = selectedAnswers[qId];
                    return (
                        <div key={qId} className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 border border-slate-200 dark:border-[#2a2a2e] shadow-sm hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors">
                            <div className="flex justify-between items-start gap-4 mb-5">
                                <h4 className="font-semibold text-slate-800 dark:text-[#E0E0E0] text-base leading-relaxed">
                                    <span className="text-slate-400 dark:text-slate-500 me-2">{t('quiz.question', { number: qIndex + 1 })}</span>
                                    {question.text ?? question.questionText}
                                </h4>
                                <span className="shrink-0 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-[#2a2a2e] px-2 py-1 rounded-lg">
                                    {t('quiz.points', { count: question.points ?? 1 })}
                                </span>
                            </div>
                            
                            <div className="space-y-3">
                                {(question.options ?? question.answerOptions ?? []).map((option: any) => {
                                    const optId = String(option.id ?? option.optionId);
                                    const isSelected = selected === optId;
                                    return (
                                        <label key={optId} className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-[#0061EF] bg-blue-50/50 dark:bg-blue-500/10' : 'border-slate-100 dark:border-[#2a2a2e] bg-slate-50 dark:bg-[#0e0e10] hover:border-slate-300 dark:hover:border-slate-600'}`}>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-[#0061EF]' : 'border-slate-300 dark:border-slate-600'}`}>
                                                {isSelected && <div className="w-2.5 h-2.5 bg-[#0061EF] rounded-full" />}
                                            </div>
                                            <span className={`text-sm font-medium ${isSelected ? 'text-[#0061EF] dark:text-blue-400' : 'text-slate-700 dark:text-[#d0d0E0]'}`}>
                                                {option.text ?? option.optionText}
                                            </span>
                                            <input 
                                                type="radio" 
                                                className="hidden" 
                                                checked={isSelected} 
                                                onChange={() => handleSelectOption(qId, optId)} 
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="max-w-3xl mx-auto mt-10 pt-6 border-t border-slate-200 dark:border-[#2a2a2e] flex flex-col items-center gap-4">
                <button 
                    onClick={() => submitExamMutation()} 
                    disabled={isSubmitting || isRedirecting || answeredCount !== totalQuestions}
                    className={`w-full md:w-auto md:min-w-[240px] px-8 py-4 rounded-xl font-bold text-white transition-all ${isSubmitting || isRedirecting || answeredCount !== totalQuestions ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' : 'bg-[#0061EF] hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-500/25'}`}
                >
                    {isRedirecting || isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 size={18} className="animate-spin" /> {t('quiz.processing')}
                        </div>
                    ) : t('quiz.submitQuiz')}
                </button>
                {answeredCount !== totalQuestions && (
                    <p className="text-sm text-slate-500 dark:text-[#d0d0E0]">
                        {t('quiz.answerAll')}
                    </p>
                )}
            </div>
        </div>
    );
}
