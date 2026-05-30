import { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PanelRightClose, PanelRightOpen, CheckSquare, Square } from 'lucide-react';
import Footer from '../../../shared/components/footerauth';
// ====== Components ======
import CourseContentSidebar from '../components/CourseContentSidebar';
import PlayerHeader from '../components/PlayerHeader';
import VideoLesson from '../components/lesson-types/VideoLesson';
import ArticleLesson from '../components/lesson-types/ArticleLesson';
import QuizLesson from '../components/lesson-types/QuizLesson';
import { useTranslation } from 'react-i18next';

// ====== Hooks ======
import {
    useGetCourseContent,
    useGetCourseMetadata,
    useGetLessonArticle,
    useCompleteLesson,
} from '../api/useCoursePlayer';

// ================= Types =================

interface FlatLesson {
    id: string;
    title: string;
    type?: string | number | undefined;
    sectionIndex: number;
    lessonIndex: number;
}
// ===============================================================
function getLessonType(raw: string | number | undefined): 'video' | 'article' | 'quiz' {
    if (raw === undefined || raw === null) return 'video';
    const s = String(raw).toLowerCase().trim();
    if (s === 'article' || s === '2') return 'article';
    if (s === 'quiz' || s === '3') return 'quiz';
    return 'video';
}

export default function CoursePlayerPage() {
    const { courseId } = useParams<{ courseId: string }>();
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === 'rtl';

    // ================= State =================
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
    const [activeLessonTitle, setActiveLessonTitle] = useState('');
    const [activeLessonType, setActiveLessonType] = useState<'video' | 'article' | 'quiz'>('video');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
    const [serverInitialized, setServerInitialized] = useState(false);

    // ================= Data Fetching =================
    const { data: courseContent, isLoading: contentLoading } = useGetCourseContent(courseId!);
    const { data: courseMetadata } = useGetCourseMetadata(courseId!);
    const { data: articleData, isLoading: articleLoading } = useGetLessonArticle(
        activeLessonType === 'article' ? activeLessonId : null
    );
    const { mutate: markLessonComplete } = useCompleteLesson(courseId!);

    // ================= Flat lessons for prev/next navigation =================
    const flatLessons = useMemo<FlatLesson[]>(() => {
        if (!courseContent?.sections) return [];
        return courseContent.sections.flatMap((section: any, sectionIndex: string | number) => {
            const lessonsArray = section.lessons || section.items || section.sectionItems || [];
            return lessonsArray.map((lesson: any, lessonIndex: string | number) => ({
                id: String(lesson.id),
                title: lesson.title,
                type: lesson.type,
                sectionIndex,
                lessonIndex,
            }));
        });
    }, [courseContent]);

    // ================= Sections with completed state =================
    const sectionsWithState = useMemo(() => {
        if (!courseContent?.sections) return [];
        return courseContent.sections.map((section: any) => ({
            ...section,
            lessons: (section.lessons || section.items || []).map((lesson: any) => ({
                ...lesson,
                id: String(lesson.id),
                isCompleted: completedLessons.has(String(lesson.id)),
                type: lesson.type,
            })),
        }));
    }, [courseContent, completedLessons]);

    // ================= Init completedLessons from server data (runs once) =================
    useEffect(() => {
        if (courseContent?.sections && !serverInitialized) {
            const serverCompleted = new Set<string>();
            courseContent.sections.forEach((section: any) => {
                const lessons = section.lessons || section.items || [];
                lessons.forEach((lesson: any) => {
                    if (lesson.isCompleted) {
                        serverCompleted.add(String(lesson.id));
                    }
                });
            });
            setCompletedLessons(serverCompleted);
            setServerInitialized(true);
        }
    }, [courseContent, serverInitialized]);

    // ================= Auto-select FIRST lesson on initial load =================
    useEffect(() => {
        if (activeLessonId === null && flatLessons.length > 0) {
            const first = flatLessons[0];
            setActiveLessonId(String(first.id));
            setActiveLessonTitle(first.title);
            setActiveLessonType(getLessonType(first.type));
        }
    }, [flatLessons, activeLessonId]);

    const currentFlatIndex = flatLessons.findIndex(l => l.id === activeLessonId);

    // ================= Lesson click handler =================
    const handleLessonSelect = useCallback((lesson: { id: string | number; title: string; type?: string | number | undefined }) => {
        setActiveLessonId(String(lesson.id));
        setActiveLessonTitle(lesson.title);
        setActiveLessonType(getLessonType(lesson.type));
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    }, []);

    // ================= Prev / Next =================
    const handlePrev = useCallback(() => {
        if (currentFlatIndex <= 0) return;
        const prev = flatLessons[currentFlatIndex - 1];
        handleLessonSelect(prev);
    }, [currentFlatIndex, flatLessons, handleLessonSelect]);

    const handleNext = useCallback(() => {
        if (currentFlatIndex >= flatLessons.length - 1) return;
        if (activeLessonId) {
            setCompletedLessons(prev => new Set([...prev, activeLessonId]));
            // Persist lesson completion to the server
            markLessonComplete(activeLessonId);
        }
        const next = flatLessons[currentFlatIndex + 1];
        handleLessonSelect(next);
    }, [currentFlatIndex, flatLessons, activeLessonId, handleLessonSelect, markLessonComplete]);

    // ================= Toggle completion from sidebar checkbox =================
    const handleLessonComplete = useCallback((lessonId: string, completed: boolean) => {
        setCompletedLessons(prev => {
            const next = new Set(prev);
            if (completed) {
                next.add(lessonId);
            } else {
                next.delete(lessonId);
            }
            return next;
        });
        // Always persist to server (the API call ignores uncomplete for now)
        if (completed) {
            markLessonComplete(lessonId);
        }
    }, [markLessonComplete]);

    // ================= Mark active lesson complete (bottom bar button) =================
    const isActiveLessonCompleted = activeLessonId ? completedLessons.has(activeLessonId) : false;
    const handleMarkCurrentComplete = useCallback(() => {
        if (!activeLessonId) return;
        handleLessonComplete(activeLessonId, !isActiveLessonCompleted);
    }, [activeLessonId, isActiveLessonCompleted, handleLessonComplete]);

    const totalLessons = flatLessons.length;
    const completedCount = completedLessons.size;
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const courseTitle = courseMetadata?.title || t('common.loading');

    return (
        <div className="flex flex-col min-h-screen bg-[#F7F9FA] dark:bg-[#0e0e10] font-sans">

            {/* ====== Top Header ====== */}
            <PlayerHeader
                courseTitle={courseTitle}
                courseId={courseId!}
                completedCount={completedCount}
                totalCount={totalLessons}
                progressPercent={progressPercent}
            />

            {/* ====== Main Body ====== */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* ====== Left: Lesson Content Area ====== */}
                <div className="flex flex-col min-w-0 transition-all duration-300 flex-1 w-full">

                    <div className="flex-1 overflow-y-auto bg-white dark:bg-[#1A1A1A]">
                        {/* VIDEO */}
                        {activeLessonType === 'video' && activeLessonId && (
                            <VideoLesson
                                lessonId={activeLessonId}
                                lessonTitle={activeLessonTitle}
                                onPrev={handlePrev}
                                onNext={handleNext}
                                hasPrev={currentFlatIndex > 0}
                                hasNext={currentFlatIndex < flatLessons.length - 1}
                            />
                        )}

                        {/* ARTICLE */}
                        {activeLessonType === 'article' && (
                            <ArticleLesson
                                articleHtml={articleData?.htmlContent ?? null}
                                isLoading={articleLoading && !!activeLessonId}
                                lessonTitle={activeLessonTitle}
                            />
                        )}

                        {/* QUIZ */}
                        {activeLessonType === 'quiz' && activeLessonId && (
                            <>
                                {console.log('Quiz lessonId passed:', activeLessonId)}
                                <QuizLesson
                                    key={activeLessonId}
                                    lessonId={activeLessonId}
                                    lessonTitle={activeLessonTitle}
                                />
                            </>
                        )}

                        {/* LOADING STATE */}
                        {contentLoading && (
                            <div className="w-full aspect-video bg-black flex items-center justify-center animate-pulse">
                                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                            </div>
                        )}
                    </div>

                    {/* ====== Bottom Control Bar ====== */}
                    <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-[#1A1A1A] border-t border-gray-200 dark:border-[#2a2a2e]">
                        <div className="min-w-0 flex items-center gap-3">
                            {!activeLessonTitle && (
                                <p className="text-gray-400 dark:text-[#d0d0E0] text-sm">
                                    {contentLoading ? t('courses.loadingCourse') : t('courses.selectLesson')}
                                </p>
                            )}

                            {/* ✅ Mark as Complete / Incomplete button */}
                            {activeLessonId && (
                                <button
                                    onClick={handleMarkCurrentComplete}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95
                                        ${ isActiveLessonCompleted
                                            ? 'bg-purple-100 dark:bg-purple-500/20 text-[#a435f0] hover:bg-purple-200 dark:hover:bg-purple-500/30 border border-purple-300 dark:border-purple-500/40'
                                            : 'bg-gray-100 dark:bg-[#2a2a2e] text-gray-600 dark:text-[#d0d0E0] hover:bg-purple-50 hover:text-[#a435f0] dark:hover:bg-purple-500/10 border border-gray-200 dark:border-[#3a3a3e]'
                                        }`}
                                >
                                    {isActiveLessonCompleted
                                        ? <><CheckSquare size={15} /> <span>{t('courses.completed', { defaultValue: 'Completed' })}</span></>
                                        : <><Square size={15} /> <span>{t('courses.markComplete', { defaultValue: 'Mark as complete' })}</span></>
                                    }
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setIsSidebarOpen(prev => !prev)}
                            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-[#d0d0E0] hover:text-gray-800 dark:hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2e] shrink-0 ms-3"
                        >
                            {isSidebarOpen
                                ? <><PanelRightClose size={16} /> <span className="hidden sm:inline">{t('courses.hideSidebar')}</span></>
                                : <><PanelRightOpen size={16} /> <span className="hidden sm:inline">{t('courses.courseContent')}</span></>
                            }
                        </button>
                    </div>
                </div>

                {/* ====== Right: Course Content Sidebar ====== */}
                {/* Mobile overlay */}
                {isSidebarOpen && (
                    <div
                        className="md:hidden absolute inset-0 bg-black/50 z-40 transition-opacity"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <div className={`
                    absolute md:relative ${isRtl ? 'left-0 border-r' : 'right-0 border-l'} top-0 bottom-0 z-50
                    w-[85vw] sm:w-[340px] shrink-0 flex-col border-gray-200 dark:border-[#2a2a2e] bg-white dark:bg-[#1A1A1A] overflow-hidden
                    transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
                    ${isSidebarOpen ? 'translate-x-0 flex' : `${isRtl ? '-translate-x-full' : 'translate-x-full'} md:hidden`}
                `}>
                    {contentLoading ? (
                        <div className="flex flex-col h-full bg-white dark:bg-[#1A1A1A] p-4 space-y-3">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="h-12 bg-gray-100 dark:bg-[#2a2a2e] rounded animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto">
                            <CourseContentSidebar
                                sections={sectionsWithState}
                                activeLessonId={activeLessonId}
                                onLessonSelect={handleLessonSelect}
                                onLessonComplete={handleLessonComplete}
                                onClose={() => setIsSidebarOpen(false)}
                                courseTitle={courseTitle}
                            />
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
