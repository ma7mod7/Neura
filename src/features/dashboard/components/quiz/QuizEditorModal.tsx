// src/components/quiz/QuizEditorModal.tsx
import React, { useState } from 'react';
import { X, Settings, ListChecks, Plus, Trash2, Save } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { createExamMetadata, addExamQuestion, deleteExamQuestion, type CreateQuestionPayload } from '../../api/quizApi';

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

    // --- Settings State (Using Defaults you requested) ---
    const [settings, setSettings] = useState({
        durationInMinutes: 30,
        maxAttempts: 3,
        passingScorePercentage: 50,
        shuffleAnswers: true,
        shuffleQuestions: true,
    });

    // --- Questions State ---
    const [questions, setQuestions] = useState<any[]>([]); // List of added questions
    const [currentQuestion, setCurrentQuestion] = useState<CreateQuestionPayload>({
        questionText: '',
        points: 1,
        questionType: 0, // 0: MCQ, 1: T/F, 2: Multiple Select
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
            maxViolationsBeforeAutoSubmit: 3, // Hardcoded per requirements
            enableTabSwitchDetection: true,
            numberOfQuestionsToServe: null, 
        }),
        onSuccess: (data) => {
            // Assume backend returns the created exam with its ID
            const newExamId = data.id || data.data?.id;
            setExamId(newExamId);
            setSyncStatus('idle');
            setActiveTab('questions'); // Move to questions tab automatically
        },
        onError: (error) => {
            console.error(error);
            setSyncStatus('error');
            alert("Failed to save exam settings.");
        }
    });

    const addQuestionMutation = useMutation({
        mutationFn: (payload: CreateQuestionPayload) => addExamQuestion(examId!, payload),
        onSuccess: (data, payload) => {
            // Optimistic update for UI list
            setQuestions([...questions, { ...payload, id: data.id || Date.now() }]);
            // Reset current question form
            setCurrentQuestion({
                questionText: '', points: 1, questionType: 0,
                options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }]
            });
            setSyncStatus('idle');
        }
    });

    const deleteQuestionMutation = useMutation({
        mutationFn: (questionId: number) => deleteExamQuestion(examId!, questionId),
        onSuccess: (_, questionId) => {
            setQuestions(questions.filter(q => q.id !== questionId));
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
        
        // If Single Choice (0) or T/F (1) and user checks an option, uncheck others
        if (field === 'isCorrect' && value === true && currentQuestion.questionType !== 2) {
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
        if (type === 1) { // True/False presets
            defaultOptions = [{ text: 'True', isCorrect: true }, { text: 'False', isCorrect: false }];
        }
        setCurrentQuestion({ ...currentQuestion, questionType: type, options: defaultOptions });
    };

    const handleSaveQuestion = () => {
        if (!currentQuestion.questionText) return alert("Question text is required");
        if (!currentQuestion.options?.some(opt => opt.isCorrect)) return alert("Please mark at least one correct answer");
        
        setSyncStatus('saving');
        addQuestionMutation.mutate(currentQuestion);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-gray-100 rounded-xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95">
                
                {/* Header */}
                <div className="bg-white px-6 py-4 flex justify-between items-center border-b">
                    <h2 className="text-xl font-bold text-gray-800">Quiz Builder: {quizTitle}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 bg-gray-100 rounded-full p-2"><X size={20} /></button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="w-64 bg-white border-r p-4 space-y-2">
                        <button 
                            onClick={() => setActiveTab('settings')}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === 'settings' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Settings size={18} /> Metadata & Rules
                        </button>
                        <button 
                            onClick={() => examId ? setActiveTab('questions') : alert("Save settings first!")}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === 'questions' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <ListChecks size={18} /> Questions
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-y-auto p-6">
                        
                        {/* ================= TAB 1: SETTINGS ================= */}
                        {activeTab === 'settings' && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-2xl">
                                <h3 className="text-lg font-bold mb-4 border-b pb-2">Quiz Settings</h3>
                                
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Minutes)</label>
                                        <input type="number" value={settings.durationInMinutes} onChange={(e) => setSettings({...settings, durationInMinutes: Number(e.target.value)})} className="w-full border rounded p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Attempts</label>
                                        <input type="number" value={settings.maxAttempts} onChange={(e) => setSettings({...settings, maxAttempts: Number(e.target.value)})} className="w-full border rounded p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
                                        <input type="number" value={settings.passingScorePercentage} onChange={(e) => setSettings({...settings, passingScorePercentage: Number(e.target.value)})} className="w-full border rounded p-2" />
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={settings.shuffleQuestions} onChange={(e) => setSettings({...settings, shuffleQuestions: e.target.checked})} className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium">Shuffle Questions</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={settings.shuffleAnswers} onChange={(e) => setSettings({...settings, shuffleAnswers: e.target.checked})} className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium">Shuffle Answers</span>
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
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex-1">
                                    <h3 className="text-lg font-bold mb-4">Add New Question</h3>
                                    
                                    <div className="flex gap-4 mb-4">
                                        <select 
                                            value={currentQuestion.questionType} 
                                            onChange={(e) => handleQuestionTypeChange(Number(e.target.value))}
                                            className="border rounded p-2 flex-1"
                                        >
                                            <option value={0}>Single Choice (MCQ)</option>
                                            <option value={1}>True / False</option>
                                            <option value={2}>Multiple Correct Answers</option>
                                        </select>
                                        <div className="flex items-center gap-2 border rounded p-2 w-32">
                                            <span className="text-sm text-gray-500">Points:</span>
                                            <input type="number" min="1" value={currentQuestion.points} onChange={(e) => setCurrentQuestion({...currentQuestion, points: Number(e.target.value)})} className="w-full outline-none" />
                                        </div>
                                    </div>

                                    <textarea 
                                        placeholder="Type your question here..." 
                                        value={currentQuestion.questionText || ''}
                                        onChange={(e) => setCurrentQuestion({...currentQuestion, questionText: e.target.value})}
                                        className="w-full border rounded p-3 min-h-[100px] mb-4"
                                    />

                                    <div className="space-y-3 mb-6">
                                        <h4 className="text-sm font-bold text-gray-700">Answer Options</h4>
                                        {currentQuestion.options?.map((opt, idx) => (
                                            <div key={idx} className={`flex items-center gap-3 p-2 rounded border ${opt.isCorrect ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                                                <input 
                                                    type={currentQuestion.questionType === 2 ? "checkbox" : "radio"} 
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
                                                    disabled={currentQuestion.questionType === 1} // Disable typing if T/F
                                                    className="flex-1 bg-transparent outline-none"
                                                />
                                                {currentQuestion.questionType !== 1 && (
                                                    <button onClick={() => handleRemoveOption(idx)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                                                )}
                                            </div>
                                        ))}
                                        {currentQuestion.questionType !== 1 && (
                                            <button onClick={handleAddOption} className="text-sm text-blue-600 font-medium flex items-center gap-1 mt-2">
                                                <Plus size={16} /> Add Option
                                            </button>
                                        )}
                                    </div>

                                    <button 
                                        onClick={handleSaveQuestion}
                                        disabled={syncStatus === 'saving'}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium w-full"
                                    >
                                        Add Question to Quiz
                                    </button>
                                </div>

                                {/* Right: Questions List */}
                                <div className="w-80 bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-full overflow-y-auto">
                                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Added Questions ({questions.length})</h3>
                                    <div className="space-y-3">
                                        {questions.length === 0 ? (
                                            <p className="text-sm text-gray-500 text-center py-8">No questions added yet.</p>
                                        ) : (
                                            questions.map((q, idx) => (
                                                <div key={q.id} className="p-3 border rounded-lg bg-gray-50 group relative">
                                                    <div className="text-sm font-medium line-clamp-2 pr-6">{idx + 1}. {q.questionText}</div>
                                                    <div className="text-xs text-gray-500 mt-1">{q.points} Points • {q.options.length} Options</div>
                                                    <button 
                                                        onClick={() => deleteQuestionMutation.mutate(q.id)}
                                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 hidden group-hover:block"
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