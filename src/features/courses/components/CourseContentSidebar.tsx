import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    ChevronDown, ChevronUp,
    PlaySquare, FileText, HelpCircle,
    X, CheckSquare, Square,
} from 'lucide-react';

interface Lesson {
    id: string;
    title: string;
    duration?: string;
    isCompleted?: boolean;
    type?: string | number;
}

interface Section {
    id: string | number;
    title: string;
    lessons: Lesson[];
    totalMinutes?: number;
}

interface CourseContentSidebarProps {
    sections: Section[];
    activeLessonId: string | null;
    onLessonSelect: (lesson: Lesson) => void;
    onClose: () => void;
    courseTitle: string;
}

// ================= Lesson type icon =================
function LessonIcon({ type }: { type: string | number | undefined }) {
    const t = String(type ?? '').toLowerCase();
    if (t === 'quiz' || t === '3') {
        return <HelpCircle size={13} className="text-yellow-500 shrink-0" />;
    }
    if (t === 'article' || t === '2') {
        return <FileText size={13} className="text-green-500 shrink-0" />;
    }
    return <PlaySquare size={13} className="text-blue-500 shrink-0" />;
}

// ================= Duration formatter =================
function formatDuration(raw?: string): string {
    if (!raw) return '';
    if (raw.includes('min') || raw.includes('hr') || raw.includes('sec')) return raw;
    const parts = raw.split(':');
    if (parts.length === 3) {
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const seconds = Math.floor(parseFloat(parts[2]));
        if (hours > 0) return `${hours}hr ${minutes}min`;
        if (minutes > 0) return `${minutes}min`;
        if (seconds > 0) return `${seconds}s`;
    }
    return raw;
}

function formatTotalMinutes(minutes?: number): string {
    if (!minutes) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}hr ${m}min` : `${m}min`;
}

export default function CourseContentSidebar({
    sections,
    activeLessonId,
    onLessonSelect,
    onClose,
}: CourseContentSidebarProps) {
    const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));
    
    // ⭐ إضافة الـ Query Client للتحكم في الكاش
    const queryClient = useQueryClient();

    // ⭐ إجبار الكومبوننت الأب إنه يعمل ريفريش للداتا من الباك إند أول ما السايد بار يفتح
    useEffect(() => {
        // بيفضي الكاش بتاع محتوى الكورس عشان يجيب التعديلات الجديدة فوراً
        queryClient.invalidateQueries({ queryKey: ['course-content'] });
    }, [queryClient]);

    const toggleSection = (index: number) => {
        setOpenSections(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#1A1A1A]">

            {/* ====== Header ====== */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2a2a2e] bg-gray-50 dark:bg-[#1A1A1A] shrink-0">
                <h2 className="font-bold text-gray-900 dark:text-[#E0E0E0] text-sm">Course content</h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 dark:text-[#d0d0E0] hover:text-gray-800 dark:hover:text-white transition-colors p-1 rounded"
                >
                    <X size={18} />
                </button>
            </div>

            {/* ====== Sections ====== */}
            <div className="flex-1 overflow-y-auto">
                {sections.map((section, sectionIndex) => {
                    const isOpen = openSections.has(sectionIndex);
                    const completedCount = section.lessons.filter(l => l.isCompleted).length;

                    return (
                        <div key={section.id} className="border-b border-gray-200 dark:border-[#2a2a2e]">

                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(sectionIndex)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-[#222222] hover:bg-gray-200 dark:hover:bg-[#2a2a2e] transition-colors text-left"
                            >
                                <div className="flex-1 min-w-0 pr-2">
                                    <p className="font-semibold text-sm text-gray-800 dark:text-[#E0E0E0] leading-snug">
                                        {section.title}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-[#d0d0E0] mt-0.5">
                                        {completedCount}/{section.lessons.length}
                                        {section.totalMinutes
                                            ? ` | ${formatTotalMinutes(section.totalMinutes)}`
                                            : ''}
                                    </p>
                                </div>
                                <span className="text-gray-500 dark:text-[#d0d0E0] shrink-0">
                                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </span>
                            </button>

                            {/* Lessons */}
                            {isOpen && (
                                <div className="bg-white dark:bg-[#1A1A1A]">
                                    {section.lessons.map((lesson) => {
                                        const isActive = lesson.id === activeLessonId;
                                        return (
                                            <button
                                                key={lesson.id}
                                                onClick={() => onLessonSelect(lesson)}
                                                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-gray-100 dark:border-[#2a2a2e] last:border-0
                                                    ${isActive
                                                        ? 'bg-purple-50 dark:bg-purple-500/10 border-l-2 border-l-[#a435f0]'
                                                        : 'hover:bg-gray-50 dark:hover:bg-[#2a2a2e]'
                                                    }`}
                                            >
                                                {/* Checkbox */}
                                                <span className={`mt-0.5 shrink-0 ${lesson.isCompleted ? 'text-[#a435f0]' : 'text-gray-400 dark:text-[#d0d0E0]'}`}>
                                                    {lesson.isCompleted
                                                        ? <CheckSquare size={15} />
                                                        : <Square size={15} />}
                                                </span>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm leading-snug ${isActive
                                                        ? 'font-semibold text-[#a435f0]'
                                                        : 'text-gray-700 dark:text-[#d0d0E0]'}`}
                                                    >
                                                        {lesson.title}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <LessonIcon type={lesson.type} />
                                                        {lesson.duration && (
                                                            <span className="text-xs text-gray-400 dark:text-[#d0d0E0]">
                                                                {formatDuration(lesson.duration)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                {sections.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-[#d0d0E0]">
                        <PlaySquare size={36} className="mb-3 opacity-40" />
                        <p className="text-sm">No content available</p>
                    </div>
                )}
            </div>
        </div>
    );
}