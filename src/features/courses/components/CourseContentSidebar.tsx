import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    ChevronDown, ChevronUp,
    PlaySquare,
    X, CheckSquare, Square,
    HelpCircle, FileText
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

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
    onLessonComplete: (lessonId: string, completed: boolean) => void;
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

function formatTotalMinutes(minutes: number | undefined, t: TFunction): string {
    if (!minutes) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0
        ? `${t('courseDetails.hours', { count: h })} ${t('courseDetails.minutes', { count: m })}`
        : t('courseDetails.minutes', { count: m });
}

export default function CourseContentSidebar({
    sections,
    activeLessonId,
    onLessonSelect,
    onLessonComplete,
    onClose,
}: CourseContentSidebarProps) {
    const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));
    const { t } = useTranslation();

    // ⭐ إجبار الكومبوننت الأب إنه يعمل ريفريش للداتا من الباك إند أول ما السايد بار يفتح
    const queryClient = useQueryClient();
    useEffect(() => {
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
                <h2 className="font-bold text-gray-900 dark:text-[#E0E0E0] text-sm">{t('courses.contentTitle')}</h2>
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
                                className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-[#222222] hover:bg-gray-200 dark:hover:bg-[#2a2a2e] transition-colors text-start"
                            >
                                <div className="flex-1 min-w-0 pe-2">
                                    <p className="font-semibold text-sm text-gray-800 dark:text-[#E0E0E0] leading-snug">
                                        {section.title}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-[#d0d0E0] mt-0.5">
                                        {completedCount}/{section.lessons.length}
                                        {section.totalMinutes
                                            ? ` | ${formatTotalMinutes(section.totalMinutes, t)}`
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
                                            <div
                                                key={lesson.id}
                                                className={`w-full flex items-start gap-3 px-4 py-3 text-start transition-colors border-b border-gray-100 dark:border-[#2a2a2e] last:border-0
                                                    ${isActive
                                                        ? 'bg-purple-50 dark:bg-purple-500/10 border-s-2 border-s-[#a435f0]'
                                                        : 'hover:bg-gray-50 dark:hover:bg-[#2a2a2e]'
                                                    }`}
                                            >
                                                {/* ✅ Clickable Checkbox — toggling completion */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onLessonComplete(lesson.id, !lesson.isCompleted);
                                                    }}
                                                    title={lesson.isCompleted ? t('courses.markIncomplete'): t('courses.markComplete')}
                                                    className={`mt-0.5 shrink-0 transition-all duration-200 rounded hover:scale-110 active:scale-95 focus:outline-none
                                                        ${lesson.isCompleted
                                                            ? 'text-[#a435f0] hover:text-purple-700'
                                                            : 'text-gray-400 dark:text-[#d0d0E0] hover:text-[#a435f0]'
                                                        }`}
                                                >
                                                    {lesson.isCompleted
                                                        ? <CheckSquare size={16} />
                                                        : <Square size={16} />}
                                                </button>

                                                {/* Lesson title — clicking navigates */}
                                                <button
                                                    onClick={() => onLessonSelect(lesson)}
                                                    className="flex-1 flex min-w-0 text-start"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                            <LessonIcon type={lesson.type} />
                                                        </div>
                                                        <p className={`text-sm leading-snug ${isActive
                                                            ? 'font-semibold text-[#a435f0]'
                                                            : 'text-gray-700 dark:text-[#d0d0E0]'}`}
                                                        >
                                                            {lesson.title}
                                                        </p>
                                                    </div>
                                                </button>
                                            </div>
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
                        <p className="text-sm">{t('courses.noContent')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
