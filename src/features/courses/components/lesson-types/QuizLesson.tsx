import { useEffect, useState } from 'react';
import { HelpCircle, Loader2,  } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
    startExamAttempt,
    saveAnswer,
    submitAttempt,
    getAttemptResults,
    getExamInfo,
    resumeAttempt
} from '../../api/examApi';
import toast from 'react-hot-toast';

interface QuizLessonProps {
    lessonId: string;
    lessonTitle: string;
}

export default function QuizLesson({ lessonId, lessonTitle }: QuizLessonProps) {
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
    const [, setSubmitted] = useState(false);
    const [, setResults] = useState<any | null>(null);
    const [started, setStarted] = useState(false);
    
    useEffect(() => {
        setAttemptId(null);
        setQuestions([]);
        setSelectedAnswers({});
        setSubmitted(false);
        setResults(null);
        setStarted(false);
    }, [lessonId]);

    const { data: examInfo, isLoading: infoLoading, error: infoError } = useQuery({
        queryKey: ['examInfo', lessonId],
        queryFn: () => getExamInfo(lessonId),
        enabled: !!lessonId,
        retry: false,
    });

    useEffect(() => {
        const fetchResumeData = async () => {
            if (examInfo?.hasInProgressAttempt && examInfo.inProgressAttemptId) {
                try {
                    const resumeData = await resumeAttempt(String(examInfo.inProgressAttemptId));
                    setAttemptId(String(examInfo.inProgressAttemptId));
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
            setAttemptId(String(data.attemptId ?? data.id));
            setQuestions(data.questions ?? []);
            setStarted(true);
        },
        onError: (error: any) => {
             const data = error.response?.data;
             console.log("Raw Error Data from Backend:", data);

             // فحص شامل لأشكال الخطأ
             if (Array.isArray(data)) {
                 toast.error(data[1] || data[0]);
             } else if (data?.errors && Array.isArray(data.errors)) {
                 toast.error(data.errors[1] || data.errors[0]);
             } else if (typeof data === 'string') {
                 toast.error(data);
             } else {
                 toast.error("Maximum attempts reached or quiz unavailable.");
             }
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
        onError: () => { toast.error("Failed to submit quiz."); }
    });

    const handleSelectOption = async (questionId: string, optionId: string) => {
        setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
        if (attemptId) {
            try { await saveAnswer(attemptId, questionId, optionId); } 
            catch (error) { toast.error("Failed to save answer."); }
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
                <HelpCircle size={48} className="text-gray-300 dark:text-[#2a2a2e] mb-3" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-[#E0E0E0] mb-2">Quiz Not Found</h2>
                <p className="text-slate-400 dark:text-[#d0d0E0] text-sm text-center max-w-sm px-4">Instructor hasn't added content yet.</p>
            </div>
        );
    }

    if (!examInfo) {
        return (
            <div className="w-full flex flex-col items-center justify-center bg-white dark:bg-[#1A1A1A]" style={{ minHeight: '420px' }}>
                <HelpCircle size={48} className="text-gray-300 dark:text-[#2a2a2e] mb-3" />
                <p className="text-gray-400 dark:text-[#d0d0E0] text-sm">Failed to load quiz info.</p>
            </div>
        );
    }

    if (!started) {
        // ⭐ تحويل القيم لأرقام لضمان المقارنة الصحيحة
        const max = examInfo.maxAttempts ? Number(examInfo.maxAttempts) : null;
        const taken = Number(examInfo.attemptsTaken || 0);
        const hasReachedMax = max !== null && max > 0 && taken >= max;

        console.log(`Debug Attempts -> Taken: ${taken}, Max: ${max}, Blocked: ${hasReachedMax}`);

        return (
            <div className="w-full bg-white dark:bg-[#1A1A1A] flex flex-col items-center justify-center px-6 py-16" style={{ minHeight: '420px' }}>
                <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6">
                    <HelpCircle size={40} className="text-[#0061EF]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-[#E0E0E0] mb-2 text-center">{examInfo.title || lessonTitle}</h2>
                <div className="flex flex-wrap gap-4 mb-8 justify-center">
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#2a2a2e] rounded-xl px-4 py-2">
                        <span className="text-sm text-slate-600 dark:text-[#d0d0E0]">{examInfo.questionCount} Questions</span>
                    </div>
                    {max !== null && (
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#2a2a2e] rounded-xl px-4 py-2">
                            <span className="text-sm text-slate-600 dark:text-[#d0d0E0]">Attempts: {taken} / {max}</span>
                        </div>
                    )}
                </div>

                {hasReachedMax ? (
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 w-full max-w-md text-center">
                        <p className="text-red-600 dark:text-red-400 font-medium text-sm">
                            You have reached the maximum number of attempts for this exam.
                        </p>
                    </div>
                ) : (
                    <button onClick={() => startExam()} disabled={isStarting} className="px-10 py-3 bg-[#0061EF] text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60">
                        {isStarting ? 'Starting...' : 'Start Quiz'}
                    </button>
                )}
            </div>
        );
    }

    // شاشة عرض الأسئلة والنتائج تبقى كما هي في الكود السابق...
    // (يمكنك نسخ باقي الأجزاء من ملفك الحالي)
    return (
        <div className="w-full bg-white dark:bg-[#1A1A1A] px-4 py-6">
            {/* نفس لوجيك عرض الأسئلة */}
            <div className="max-w-2xl mx-auto space-y-6">
                 {questions.map((question: any, qIndex: number) => {
                    const qId = String(question.id ?? question.questionId);
                    const selected = selectedAnswers[qId];
                    return (
                        <div key={qId} className="bg-slate-50 dark:bg-[#0e0e10] rounded-xl p-5 border border-slate-200 dark:border-[#2a2a2e]">
                            <p className="font-semibold text-slate-800 dark:text-[#E0E0E0] mb-4 text-sm">
                                <span className="text-[#0061EF] mr-2">{qIndex + 1}.</span>
                                {question.text ?? question.questionText}
                            </p>
                            <div className="space-y-2">
                                {(question.options ?? question.answerOptions ?? []).map((option: any) => {
                                    const optId = String(option.id ?? option.optionId);
                                    return (
                                        <button key={optId} onClick={() => handleSelectOption(qId, optId)}
                                            className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${selected === optId ? 'border-[#0061EF] bg-blue-50 text-[#0061EF]' : 'bg-white text-slate-700'}`}>
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
                <button onClick={() => handleSubmit()} disabled={isSubmitting || Object.keys(selectedAnswers).length === 0}
                    className="px-8 py-3 rounded-xl font-bold text-white bg-[#0061EF] hover:bg-blue-700">
                    {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
            </div>
        </div>
    );
}