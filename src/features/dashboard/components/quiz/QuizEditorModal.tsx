import React, { useEffect, useRef, useState } from 'react';
import { X, Settings, ListChecks, Plus, Trash2, Save, CheckCircle } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createExamMetadata,
    updateExamMetadata,
    addExamQuestion,
    deleteExamQuestion,
    getExamDetails, 
    type CreateQuestionPayload,
} from '../../api/quizApi';
import toast from 'react-hot-toast';

interface QuizEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    lessonId: number;
    quizTitle: string;
    action: 'add' | 'edit';
}

export const QuizEditorModal: React.FC<QuizEditorModalProps> = ({
    isOpen, onClose, lessonId, quizTitle, action
}) => {
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState<'settings' | 'questions'>('settings');
    const examIdRef = useRef<number | null>(null);
    
    const [modalMode, setModalMode] = useState<'add' | 'edit'>(action); 
    
    const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [settings, setSettings] = useState({
        durationInMinutes: 30,
        maxAttempts: 3,
        passingScorePercentage: 50,
        numberOfQuestionsToServe: '',
        shuffleAnswers: true,
        shuffleQuestions: true,
        enableTabSwitchDetection: true,
    });

    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<CreateQuestionPayload>({
        questionText: '',
        points: 1,
        questionType: 0, // Default to Single Choice
        options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }]
    });
    
    const { data: existingExam, isError: isExamError } = useQuery({
        queryKey: ['examDetails', lessonId],
        queryFn: () => getExamDetails(lessonId),
        enabled: !!lessonId && modalMode === 'edit',
        retry: false,
    });

    useEffect(() => {
        setModalMode(action);
        if (action === 'add') {
            setActiveTab('settings');
            examIdRef.current = null;
            setSettings({
                durationInMinutes: 30,
                maxAttempts: 3,
                passingScorePercentage: 50,
                numberOfQuestionsToServe: '',
                shuffleAnswers: true,
                shuffleQuestions: true,
                enableTabSwitchDetection: true,
            });
            setQuestions([]);
        }
    }, [action, lessonId, isOpen]);

    useEffect(() => {
        if (existingExam?.id && modalMode === 'edit') {
            examIdRef.current = existingExam.id;
            setSettings({
                durationInMinutes: existingExam.durationInMinutes ?? 30,
                maxAttempts: existingExam.maxAttempts ?? 3,
                passingScorePercentage: existingExam.passingScorePercentage ?? 50,
                numberOfQuestionsToServe: existingExam.numberOfQuestionsToServe ?? '',
                shuffleAnswers: existingExam.shuffleAnswers ?? true,
                shuffleQuestions: existingExam.shuffleQuestions ?? true,
                enableTabSwitchDetection: existingExam.enableTabSwitchDetection ?? true,
            });
            
            if (existingExam.questions && Array.isArray(existingExam.questions)) {
                setQuestions(existingExam.questions);
            }
            setSyncStatus('saved');
        } else if (isExamError) {
            examIdRef.current = null;
        }
    }, [existingExam, modalMode, isExamError]);

    const createSettingsMutation = useMutation({
        mutationFn: (payload: any) => createExamMetadata(payload),
        onSuccess: (data) => {
            const id = data?.id ?? data?.data?.id;
            examIdRef.current = id;
            setSyncStatus('saved');
            setModalMode('edit');
            toast.success('Quiz created & Settings saved!');
            queryClient.invalidateQueries({ queryKey: ['examDetails', lessonId] });
            setTimeout(() => setActiveTab('questions'), 600);
        },
        onError: (error: any) => {
            void error
            setSyncStatus('error');
            toast.error('Failed to create quiz settings.');
        }
    });

    const updateSettingsMutation = useMutation({
        mutationFn: (payload: any) => updateExamMetadata(lessonId, payload),
        onSuccess: () => {
            setSyncStatus('saved');
            toast.success('Settings updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['examDetails', lessonId] });
            setTimeout(() => setActiveTab('questions'), 600);
        },
        onError: (error: any) => {
            void error
            setSyncStatus('error');
            toast.error('Failed to update settings.');
        }
    });

    const addQuestionMutation = useMutation({
        mutationFn: (payload: CreateQuestionPayload) => addExamQuestion(lessonId!, payload),
        onSuccess: () => {
            setCurrentQuestion({
                questionText: '', points: 1, questionType: 0,
                options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }]
            });
            setSyncStatus('idle');
            toast.success('Question added!');
            queryClient.invalidateQueries({ queryKey: ['examDetails', lessonId] });
        },
        onError: (error: any) => {
            void error
            setSyncStatus('error');
            toast.error('Failed to add question.');
        }
    });

    const deleteQuestionMutation = useMutation({
        mutationFn: (questionId: number) => deleteExamQuestion(lessonId!, questionId),
        onSuccess: () => {
            toast.success('Question deleted!');
            queryClient.invalidateQueries({ queryKey: ['examDetails', lessonId] });
        }
    });

    const handleSaveSettings = () => {
        const payload = {
            lessonId: lessonId,
            title: quizTitle,
            description: null,
            durationInMinutes: settings.durationInMinutes,
            maxAttempts: settings.maxAttempts,
            passingScorePercentage: settings.passingScorePercentage,
            shuffleAnswers: settings.shuffleAnswers,
            shuffleQuestions: settings.shuffleQuestions,
            maxViolationsBeforeAutoSubmit: 3,
            enableTabSwitchDetection: settings.enableTabSwitchDetection,
            numberOfQuestionsToServe: settings.numberOfQuestionsToServe
                ? Number(settings.numberOfQuestionsToServe)
                : null,
        };
        setSyncStatus('saving');
        if (examIdRef.current) {
            updateSettingsMutation.mutate(payload);
        } else {
            createSettingsMutation.mutate(payload);
        }
    };

    // ⭐ التعديل المطلوب: تحديث أنواع الأسئلة وفقاً للباك إند
    const handleTypeChange = (type: number) => {
        const defaultOptions = type === 2 // True/False (2)
            ? [{ text: 'True', isCorrect: true }, { text: 'False', isCorrect: false }]
            : [{ text: '', isCorrect: false }, { text: '', isCorrect: false }];
        setCurrentQuestion({ ...currentQuestion, questionType: type, options: defaultOptions });
    };

    const handleUpdateOption = (index: number, field: 'text' | 'isCorrect', value: any) => {
        const newOptions = [...(currentQuestion.options || [])];
        // في النوع 0 (Single) و 2 (T/F)، نسمح باختيار صحيح واحد فقط
        if (field === 'isCorrect' && value && (currentQuestion.questionType === 0 || currentQuestion.questionType === 2)) {
            newOptions.forEach(o => o.isCorrect = false);
        }
        newOptions[index] = { ...newOptions[index], [field]: value };
        setCurrentQuestion({ ...currentQuestion, options: newOptions });
    };

    const handleSaveQuestion = () => {
        if (!examIdRef.current) return toast.error('Please save Quiz settings first!');
        if (!currentQuestion.questionText?.trim()) return toast.error('Question text is required.');
        if (!currentQuestion.options?.some(o => o.isCorrect)) return toast.error('Mark at least one correct answer.');
        if (currentQuestion.options?.some(o => !o.text.trim())) return toast.error('All options must have text.');
        setSyncStatus('saving');
        addQuestionMutation.mutate(currentQuestion);
    };

    if (!isOpen) return null;

    // ⭐ التعديل المطلوب: مسميات الأنواع وفقاً للأرقام الجديدة
    const typeLabels: Record<number, string> = { 0: 'Single', 1: 'Multi', 2: 'T/F' };
    const isSaving = createSettingsMutation.isPending || updateSettingsMutation.isPending;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-[#2a2a2e]">

                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#2a2a2e] bg-slate-50 dark:bg-[#111111] shrink-0">
                    <div className="flex items-center gap-3">
                        <h2 className="text-base font-bold text-slate-800 dark:text-[#E0E0E0]">
                            {examIdRef.current ? 'Edit Quiz' : 'Create New Quiz'}
                        </h2>
                        <span className="text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full">
                            {quizTitle}
                        </span>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 dark:border-[#2a2a2e] hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 text-slate-400 dark:text-[#d0d0E0] transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <div className="w-52 shrink-0 border-r border-slate-200 dark:border-[#2a2a2e] bg-slate-50 dark:bg-[#111111] flex flex-col p-3 gap-1">
                        <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${activeTab === 'settings' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-[#d0d0E0] hover:bg-white dark:hover:bg-[#2a2a2e]'}`}>
                            <Settings size={15} /> Settings
                        </button>
                        <button onClick={() => { if (!examIdRef.current) return toast.error('Save settings first!'); setActiveTab('questions'); }} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${activeTab === 'questions' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-[#d0d0E0] hover:bg-white dark:hover:bg-[#2a2a2e]'}`}>
                            <ListChecks size={15} /> Questions
                        </button>
                        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-[#2a2a2e]">
                            <p className="text-xs text-slate-400 dark:text-[#d0d0E0] mb-0.5">Questions added</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-[#E0E0E0]">{questions.length}</p>
                        </div>
                    </div>

                    {activeTab === 'settings' && (
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="max-w-2xl flex flex-col gap-5">
                                <div className="bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-[#2a2a2e] rounded-xl p-5">
                                    <h3 className="text-xs font-bold text-slate-400 dark:text-[#d0d0E0] uppercase tracking-wider mb-4">Quiz rules</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Duration (minutes)', key: 'durationInMinutes', min: 1 },
                                            { label: 'Max attempts', key: 'maxAttempts', min: 1 },
                                            { label: 'Passing score (%)', key: 'passingScorePercentage', min: 0, max: 100 },
                                        ].map(({ label, key, min, max }) => (
                                            <div key={key}>
                                                <label className="block text-xs text-slate-500 dark:text-[#d0d0E0] mb-1">{label}</label>
                                                <input type="number" min={min} max={max} value={(settings as any)[key]} onChange={e => setSettings({ ...settings, [key]: Number(e.target.value) })} className="w-full border border-slate-200 dark:border-[#2a2a2e] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1A1A1A] text-slate-800 dark:text-[#E0E0E0] focus:outline-none focus:border-blue-500" />
                                            </div>
                                        ))}
                                        <div>
                                            <label className="block text-xs text-slate-500 dark:text-[#d0d0E0] mb-1">Questions to serve</label>
                                            <input type="number" placeholder="All" value={settings.numberOfQuestionsToServe} onChange={e => setSettings({ ...settings, numberOfQuestionsToServe: e.target.value })} className="w-full border border-slate-200 dark:border-[#2a2a2e] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1A1A1A] text-slate-800 dark:text-[#E0E0E0] focus:outline-none focus:border-blue-500" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-[#2a2a2e] rounded-xl p-5">
                                    <h3 className="text-xs font-bold text-slate-400 dark:text-[#d0d0E0] uppercase tracking-wider mb-4">Behavior</h3>
                                    <div className="flex flex-col gap-3">
                                        {[
                                            { label: 'Shuffle questions', key: 'shuffleQuestions' },
                                            { label: 'Shuffle answers', key: 'shuffleAnswers' },
                                            { label: 'Tab switch detection', key: 'enableTabSwitchDetection' },
                                        ].map(({ label, key }) => (
                                            <div key={key} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-[#2a2a2e] last:border-0">
                                                <span className="text-sm text-slate-700 dark:text-[#d0d0E0]">{label}</span>
                                                <button onClick={() => setSettings(s => ({ ...s, [key]: !(s as any)[key] }))} className={`w-10 h-5 rounded-full transition-colors relative ${(settings as any)[key] ? 'bg-blue-600' : 'bg-slate-300 dark:bg-[#3a3a3e]'}`}>
                                                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${(settings as any)[key] ? 'left-5' : 'left-0.5'}`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={handleSaveSettings} disabled={isSaving} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors">
                                    {syncStatus === 'saved' && examIdRef.current ? <><CheckCircle size={16} /> Saved — Go to questions</> : isSaving ? 'Saving...' : <><Save size={16} /> Save &amp; continue</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'questions' && (
                        <div className="flex-1 overflow-hidden flex gap-0">
                            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                                <div className="bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-[#2a2a2e] rounded-xl p-5">
                                    <h3 className="text-xs font-bold text-slate-400 dark:text-[#d0d0E0] uppercase tracking-wider mb-4">New question</h3>
                                    <div className="flex gap-3 mb-4">
                                        {/* ⭐ التعديل المطلوب: تحديث قيم الـ Select لتطابق الباك إند */}
                                        <select
                                            value={currentQuestion.questionType}
                                            onChange={e => handleTypeChange(Number(e.target.value))}
                                            className="flex-1 border border-slate-200 dark:border-[#2a2a2e] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1A1A1A] text-slate-800 dark:text-[#E0E0E0] focus:outline-none focus:border-blue-500"
                                        >
                                            <option value={0}>Single choice (0)</option>
                                            <option value={1}>Multiple choice (1)</option>
                                            <option value={2}>True / False (2)</option>
                                        </select>
                                        <input type="number" min={1} value={currentQuestion.points} onChange={e => setCurrentQuestion({ ...currentQuestion, points: Number(e.target.value) })} className="w-20 border border-slate-200 dark:border-[#2a2a2e] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1A1A1A] text-slate-800 dark:text-[#E0E0E0] focus:outline-none focus:border-blue-500" placeholder="pts" />
                                    </div>

                                    <textarea value={currentQuestion.questionText || ''} onChange={e => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })} placeholder="Type your question here..." rows={3} className="w-full border border-slate-200 dark:border-[#2a2a2e] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1A1A1A] text-slate-800 dark:text-[#E0E0E0] focus:outline-none focus:border-blue-500 resize-none mb-4" />

                                    <h4 className="text-xs font-bold text-slate-400 dark:text-[#d0d0E0] uppercase tracking-wider mb-3">Answer options</h4>
                                    <div className="flex flex-col gap-2 mb-3">
                                        {currentQuestion.options?.map((opt, idx) => (
                                            <div key={idx} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${opt.isCorrect ? 'border-green-400 dark:border-green-500/60 bg-green-50 dark:bg-green-500/10' : 'border-slate-200 dark:border-[#2a2a2e] bg-white dark:bg-[#1A1A1A]'}`}>
                                                {/* التغيير لـ Checkbox فقط في حالة Multiple Choice (1) */}
                                                <input
                                                    type={currentQuestion.questionType === 1 ? 'checkbox' : 'radio'}
                                                    name="correct"
                                                    checked={opt.isCorrect}
                                                    onChange={e => handleUpdateOption(idx, 'isCorrect', e.target.checked)}
                                                    className="w-4 h-4 accent-green-600 cursor-pointer"
                                                />
                                                <input type="text" value={opt.text || ''} onChange={e => handleUpdateOption(idx, 'text', e.target.value)} placeholder={`Option ${idx + 1}`} disabled={currentQuestion.questionType === 2} className="flex-1 bg-transparent text-sm text-slate-700 dark:text-[#d0d0E0] outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 disabled:text-slate-400" />
                                                {currentQuestion.questionType !== 2 && (
                                                    <button onClick={() => { if ((currentQuestion.options?.length || 0) <= 2) return; setCurrentQuestion({ ...currentQuestion, options: currentQuestion.options ? currentQuestion.options.filter((_, i) => i !== idx) : null }); }} className="text-slate-300 dark:text-[#3a3a3e] hover:text-red-500 transition-colors">
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {currentQuestion.questionType !== 2 && (
                                        <button onClick={() => setCurrentQuestion({ ...currentQuestion, options: [...(currentQuestion.options || []), { text: '', isCorrect: false }] })} className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 hover:opacity-75 mb-4">
                                            <Plus size={14} /> Add option
                                        </button>
                                    )}
                                </div>
                                <button onClick={handleSaveQuestion} disabled={addQuestionMutation.isPending} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium text-sm transition-colors">
                                    {addQuestionMutation.isPending ? 'Adding...' : 'Add question to quiz'}
                                </button>
                            </div>

                            <div className="w-72 shrink-0 border-l border-slate-200 dark:border-[#2a2a2e] bg-slate-50 dark:bg-[#111111] overflow-y-auto p-4">
                                <h3 className="text-xs font-bold text-slate-400 dark:text-[#d0d0E0] uppercase tracking-wider mb-4">Added ({questions.length})</h3>
                                {questions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-slate-300 dark:text-[#3a3a3e]"><ListChecks size={32} className="mb-2" /><p className="text-xs">No questions yet</p></div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {questions.map((q, idx) => (
                                            <div key={q.id} className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2a2a2e] rounded-xl p-3 group relative">
                                                <p className="text-xs font-medium text-slate-700 dark:text-[#E0E0E0] line-clamp-2 pr-5 mb-1">{idx + 1}. {q.questionText || 'Untitled Question'}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded">{typeLabels[q.questionType]}</span>
                                                    <span className="text-[10px] text-slate-400 dark:text-[#d0d0E0]">{q.points} pt{q.points !== 1 ? 's' : ''} · {q.options?.length} options</span>
                                                </div>
                                                <button onClick={() => deleteQuestionMutation.mutate(q.id)} className="absolute top-2.5 right-2.5 text-slate-300 dark:text-[#3a3a3e] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={13} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};