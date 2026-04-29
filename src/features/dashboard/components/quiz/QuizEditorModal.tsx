// src/components/quiz/QuizEditorModal.tsx
import React, { useState } from 'react';
import { X, Settings, ListChecks, Plus, Trash2, Save } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { createExamMetadata, addExamQuestion, deleteExamQuestion, type CreateQuestionPayload } from '../../api/quizApi';
import toast from 'react-hot-toast';

interface QuizEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    lessonId: number;
    quizTitle: string;
}

export const QuizEditorModal: React.FC<QuizEditorModalProps> = ({ isOpen, onClose, lessonId, quizTitle }) => {
    const [activeTab, setActiveTab] = useState<'settings' | 'questions'>('settings');
    const [examId, setExamId] = useState<number | null>(null);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'error'>('idle');

    // --- Settings State ---
    const [settings, setSettings] = useState({
        durationInMinutes: 30,
        maxAttempts: 3,
        passingScorePercentage: 50,
        shuffleAnswers: true,
        shuffleQuestions: true,
    });

    // --- Questions State ---
    const [questions, setQuestions] = useState<any[]>([]); 
    const [currentQuestion, setCurrentQuestion] = useState<CreateQuestionPayload>({
        questionText: '',
        points: 1,
        questionType: 0, 
        options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }]
    });

    // ================== Mutations ==================
    const saveSettingsMutation = useMutation({
        mutationFn: () => createExamMetadata({
            lessonId: lessonId,
            title: quizTitle,
            description: null,
            durationInMinutes: settings.durationInMinutes,
            maxAttempts: settings.maxAttempts,
            passingScorePercentage: settings.passingScorePercentage,
            shuffleAnswers: settings.shuffleAnswers,
            shuffleQuestions: settings.shuffleQuestions,
            maxViolationsBeforeAutoSubmit: 3, 
            enableTabSwitchDetection: true,
            numberOfQuestionsToServe: null, 
        }),
        onSuccess: (data) => {
            const newExamId = data.id || data.data?.id;
            setExamId(newExamId);
            setSyncStatus('idle');
            setActiveTab('questions'); 
            toast.success("Exam settings saved!");
        },
        onError: (error) => {
            console.error(error);
            setSyncStatus('error');
            toast.error("Failed to save exam settings.");
        }
    });

    const addQuestionMutation = useMutation({
        mutationFn: (payload: CreateQuestionPayload) => addExamQuestion(examId!, payload),
        onSuccess: (data, payload) => {
            setQuestions([...questions, { ...payload, id: data.id || Date.now() }]);
            setCurrentQuestion({
                questionText: '', points: 1, questionType: 0,
                options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }]
            });
            setSyncStatus('idle');
            toast.success("Question added successfully!");
        },
        onError: (error) => {
            console.error(error);
            setSyncStatus('error');
            toast.error("Failed to add question. Please check your inputs.");
        }
    });

    const deleteQuestionMutation = useMutation({
        mutationFn: (questionId: number) => deleteExamQuestion(examId!, questionId),
        onSuccess: (_, questionId) => {
            setQuestions(questions.filter(q => q.id !== questionId));
            toast.success("Question deleted!");
        }
    });

    // ================== Handlers ==================
    const handleSaveSettings = () => {
        setSyncStatus('saving');
        saveSettingsMutation.mutate();
    };

    const handleAddOption = () => {
        setCurrentQuestion({
            ...currentQuestion,
            options: [...(currentQuestion.options || []), { text: '', isCorrect: false }]
        });
    };

    const handleUpdateOption = (index: number, field: 'text' | 'isCorrect', value: any) => {
        const newOptions = [...(currentQuestion.options || [])];
        
        if (field === 'isCorrect' && value === true && currentQuestion.questionType !== 1) {
            newOptions.forEach(opt => opt.isCorrect = false);
        }
        
        newOptions[index] = { ...newOptions[index], [field]: value };
        setCurrentQuestion({ ...currentQuestion, options: newOptions });
    };

    const handleRemoveOption = (index: number) => {
        const newOptions = currentQuestion.options?.filter((_, i) => i !== index);
        setCurrentQuestion({ ...currentQuestion, options: newOptions || [] });
    };

    const handleQuestionTypeChange = (type: number) => {
        let defaultOptions = [{ text: '', isCorrect: false }, { text: '', isCorrect: false }];
        if (type === 2) { 
            defaultOptions = [{ text: 'True', isCorrect: true }, { text: 'False', isCorrect: false }];
        }
        setCurrentQuestion({ ...currentQuestion, questionType: type, options: defaultOptions });
    };

    const handleSaveQuestion = () => {
        if (!currentQuestion.questionText?.trim()) {
            return toast.error("Question text is required.");
        }
        if (!currentQuestion.options?.some(opt => opt.isCorrect)) {
            return toast.error("Please mark at least one correct answer.");
        }
        
        const hasEmptyOption = currentQuestion.options?.some(opt => !opt.text.trim());
        if (hasEmptyOption) {
            return toast.error("All options must have text. Please fill or remove empty options.");
        }
        
        setSyncStatus('saving');
        addQuestionMutation.mutate(currentQuestion);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-gray-100 dark:bg-[#0e0e10] rounded-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95">
                
                {/* Header */}
                <div className="bg-white dark:bg-[#1A1A1A] px-6 py-4 flex justify-between items-center border-b dark:border-[#2a2a2e]">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-[#E0E0E0]">Quiz Builder: {quizTitle}</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-[#d0d0E0] hover:text-red-500 dark:hover:text-red-400 bg-gray-100 dark:bg-[#2a2a2e] rounded-full p-2 transition-colors"><X size={20} /></button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="w-64 bg-white dark:bg-[#1A1A1A] border-r dark:border-[#2a2a2e] p-4 space-y-2">
                        <button 
                            onClick={() => setActiveTab('settings')}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === 'settings' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-[#d0d0E0] hover:bg-gray-50 dark:hover:bg-[#2a2a2e]'}`}
                        >
                            <Settings size={18} /> Metadata & Rules
                        </button>
                        <button 
                            onClick={() => {
                                if (!examId) toast.error("Save settings first!");
                                else setActiveTab('questions');
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === 'questions' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-[#d0d0E0] hover:bg-gray-50 dark:hover:bg-[#2a2a2e]'}`}
                        >
                            <ListChecks size={18} /> Questions
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-y-auto p-6">
                        
                        {/* ================= TAB 1: SETTINGS ================= */}
                        {activeTab === 'settings' && (
                            <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-[#2a2a2e] max-w-2xl">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-[#E0E0E0] mb-4 border-b dark:border-[#2a2a2e] pb-2">Quiz Settings</h3>
                                
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-[#E0E0E0] mb-1">Duration (Minutes)</label>
                                        <input type="number" value={settings.durationInMinutes} onChange={(e) => setSettings({...settings, durationInMinutes: Number(e.target.value)})} className="w-full border dark:border-[#2a2a2e] bg-transparent dark:text-[#E0E0E0] rounded p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-[#E0E0E0] mb-1">Max Attempts</label>
                                        <input type="number" value={settings.maxAttempts} onChange={(e) => setSettings({...settings, maxAttempts: Number(e.target.value)})} className="w-full border dark:border-[#2a2a2e] bg-transparent dark:text-[#E0E0E0] rounded p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-[#E0E0E0] mb-1">Passing Score (%)</label>
                                        <input type="number" value={settings.passingScorePercentage} onChange={(e) => setSettings({...settings, passingScorePercentage: Number(e.target.value)})} className="w-full border dark:border-[#2a2a2e] bg-transparent dark:text-[#E0E0E0] rounded p-2" />
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={settings.shuffleQuestions} onChange={(e) => setSettings({...settings, shuffleQuestions: e.target.checked})} className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium dark:text-[#E0E0E0]">Shuffle Questions</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={settings.shuffleAnswers} onChange={(e) => setSettings({...settings, shuffleAnswers: e.target.checked})} className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium dark:text-[#E0E0E0]">Shuffle Answers</span>
                                    </label>
                                </div>

                                <button 
                                    onClick={handleSaveSettings} 
                                    disabled={syncStatus === 'saving'}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex justify-center items-center gap-2"
                                >
                                    <Save size={18} /> {syncStatus === 'saving' ? 'Saving...' : (examId ? 'Update Settings' : 'Save & Continue to Questions')}
                                </button>
                            </div>
                        )}

                        {/* ================= TAB 2: QUESTIONS ================= */}
                        {activeTab === 'questions' && (
                            <div className="flex gap-6 h-full items-start">
                                {/* Left: New Question Form */}
                                <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-[#2a2a2e] flex-1">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-[#E0E0E0] mb-4">Add New Question</h3>
                                    
                                    <div className="flex gap-4 mb-4">
                                        <select 
                                            value={currentQuestion.questionType} 
                                            onChange={(e) => handleQuestionTypeChange(Number(e.target.value))}
                                            className="border dark:border-[#2a2a2e] bg-transparent dark:text-[#E0E0E0] dark:bg-[#0e0e10] rounded p-2 flex-1"
                                        >
                                            <option value={0}>Single Choice (MCQ)</option>
                                            <option value={1}>Multiple Correct Answers</option>
                                            <option value={2}>True / False</option>
                                        </select>
                                        <div className="flex items-center gap-2 border dark:border-[#2a2a2e] rounded p-2 w-32">
                                            <span className="text-sm text-gray-500 dark:text-[#d0d0E0]">Points:</span>
                                            <input type="number" min="1" value={currentQuestion.points} onChange={(e) => setCurrentQuestion({...currentQuestion, points: Number(e.target.value)})} className="w-full outline-none bg-transparent dark:text-[#E0E0E0]" />
                                        </div>
                                    </div>

                                    <textarea 
                                        placeholder="Type your question here..." 
                                        value={currentQuestion.questionText || ''}
                                        onChange={(e) => setCurrentQuestion({...currentQuestion, questionText: e.target.value})}
                                        className="w-full border dark:border-[#2a2a2e] bg-transparent dark:text-[#E0E0E0] rounded p-3 min-h-[100px] mb-4 focus:outline-blue-500"
                                    />

                                    <div className="space-y-3 mb-6">
                                        <h4 className="text-sm font-bold text-gray-700 dark:text-[#E0E0E0]">Answer Options</h4>
                                        {currentQuestion.options?.map((opt, idx) => (
                                            <div key={idx} className={`flex items-center gap-3 p-2 rounded border ${opt.isCorrect ? 'border-green-400 dark:border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-[#3a3a3e]'}`}>
                                                <input 
                                                    type={currentQuestion.questionType === 1 ? "checkbox" : "radio"} 
                                                    name="correctAnswer"
                                                    checked={opt.isCorrect}
                                                    onChange={(e) => handleUpdateOption(idx, 'isCorrect', e.target.checked)}
                                                    className="w-5 h-5 accent-green-600"
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder={`Option ${idx + 1}`}
                                                    value={opt.text}
                                                    onChange={(e) => handleUpdateOption(idx, 'text', e.target.value)}
                                                    disabled={currentQuestion.questionType === 2} 
                                                    className="flex-1 bg-transparent outline-none dark:text-[#E0E0E0] disabled:text-gray-400 dark:disabled:text-gray-600"
                                                />
                                                {currentQuestion.questionType !== 2 && (
                                                    <button onClick={() => handleRemoveOption(idx)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"><Trash2 size={16} /></button>
                                                )}
                                            </div>
                                        ))}
                                        {currentQuestion.questionType !== 2 && (
                                            <button onClick={handleAddOption} className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 mt-2 hover:opacity-80">
                                                <Plus size={16} /> Add Option
                                            </button>
                                        )}
                                    </div>

                                    <button 
                                        onClick={handleSaveQuestion}
                                        disabled={syncStatus === 'saving'}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium w-full transition-colors"
                                    >
                                        {syncStatus === 'saving' ? 'Saving...' : 'Add Question to Quiz'}
                                    </button>
                                </div>

                                {/* Right: Questions List */}
                                <div className="w-80 bg-white dark:bg-[#1A1A1A] p-4 rounded-xl shadow-sm border border-gray-200 dark:border-[#2a2a2e] h-full overflow-y-auto">
                                    <h3 className="font-bold text-gray-800 dark:text-[#E0E0E0] mb-4 border-b dark:border-[#2a2a2e] pb-2">Added Questions ({questions.length})</h3>
                                    <div className="space-y-3">
                                        {questions.length === 0 ? (
                                            <p className="text-sm text-gray-500 dark:text-[#d0d0E0] text-center py-8">No questions added yet.</p>
                                        ) : (
                                            questions.map((q, idx) => (
                                                <div key={q.id} className="p-3 border border-transparent dark:border-[#3a3a3e] rounded-lg bg-gray-50 dark:bg-[#2a2a2e] group relative">
                                                    <div className="text-sm font-medium line-clamp-2 pr-6 dark:text-[#E0E0E0]">{idx + 1}. {q.questionText}</div>
                                                    <div className="text-xs text-gray-500 dark:text-[#d0d0E0] mt-1">{q.points} Points • {q.options.length} Options</div>
                                                    <button 
                                                        onClick={() => deleteQuestionMutation.mutate(q.id)}
                                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hidden group-hover:block transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};