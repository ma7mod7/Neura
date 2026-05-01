import { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import Footer from '../../../shared/components/Footer';
// ====== Components ======
import CourseContentSidebar from '../components/CourseContentSidebar';
import PlayerHeader from '../components/PlayerHeader';
import VideoLesson from '../components/lesson-types/VideoLesson';
import ArticleLesson from '../components/lesson-types/ArticleLesson';
import QuizLesson from '../components/lesson-types/QuizLesson';

// ====== Hooks ======
import {
    useGetCourseContent,
    useGetCourseMetadata,
    useGetLessonArticle,
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

    // ================= State =================
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
    const [activeLessonTitle, setActiveLessonTitle] = useState('');
    const [activeLessonType, setActiveLessonType] = useState<'video' | 'article' | 'quiz'>('video');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

    // ================= Data Fetching =================
    const { data: courseContent, isLoading: contentLoading } = useGetCourseContent(courseId!);
    const { data: courseMetadata } = useGetCourseMetadata(courseId!);
    const { data: articleData, isLoading: articleLoading } = useGetLessonArticle(
        activeLessonType === 'article' ? activeLessonId : null
    );

    // ================= Flat lessons for prev/next navigation =================
    const flatLessons = useMemo<FlatLesson[]>(() => {
        if (!courseContent?.sections) return [];
        
        return courseContent.sections.flatMap((section: any, sectionIndex: string|number) => {
            const lessonsArray = section.lessons || section.items || section.sectionItems || [];
            
            return lessonsArray.map((lesson: any, lessonIndex: string|number) => ({
                id: String(lesson.id),
                title: lesson.title,
                type: lesson.type,
                sectionIndex,
                lessonIndex,
            }));
        });
    }, [courseContent]);

    // ================= Sections=================
    const sectionsWithState = useMemo(() => {
        if (!courseContent?.sections) return [];
        
        return courseContent.sections.map((section: any) => ({
            ...section,
            lessons: (section.lessons || section.items || []).map((lesson: any) => ({
                ...lesson,
                id: String(lesson.id),
                isCompleted: completedLessons.has(String(lesson.id)),
                type: lesson.type 
            })),
        }));
    }, [courseContent, completedLessons]);

    // ================= Auto-select FIRST lesson on initial load =================
    useEffect(() => {
        if (activeLessonId === null && flatLessons.length > 0) {
            const first = flatLessons[0];
            setActiveLessonId(String(first.id));
            setActiveLessonTitle(first.title);
            setActiveLessonType(getLessonType(first.type));
        }
        console.log('flatLessons:', flatLessons.map(l => ({ id: l.id, title: l.title, type: l.type })));
    }, [flatLessons, activeLessonId]);

    const currentFlatIndex = flatLessons.findIndex(l => l.id === activeLessonId);

    // ================= Lesson click handler =================
    // Accept a lightweight lesson like object () CourseContentSidebar or flatLessons)
    const handleLessonSelect = useCallback((lesson: { id: string | number; title: string; type?: string | number | undefined }) => {
        setActiveLessonId(String(lesson.id));
        setActiveLessonTitle(lesson.title);
        setActiveLessonType(getLessonType(lesson.type));
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
        }
        const next = flatLessons[currentFlatIndex + 1];
        handleLessonSelect(next);
    }, [currentFlatIndex, flatLessons, activeLessonId, handleLessonSelect]);

    const totalLessons = flatLessons.length;
    const completedCount = completedLessons.size;
    const courseTitle = courseMetadata?.title || 'Loading...';

    return (
        <div className="flex flex-col min-h-screen bg-[#F7F9FA] dark:bg-[#0e0e10] font-sans">

            {/* ====== Top Header ====== */}
            <PlayerHeader
                courseTitle={courseTitle}
                courseId={courseId!}
                completedCount={completedCount}
                totalCount={totalLessons}
            />

            {/* ====== Main Body ====== */}
            <div className="flex flex-1 overflow-hidden">

                {/* ====== Left: Lesson Content Area ====== */}
                <div className={`flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'flex-1' : 'w-full'}`}>

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

                        {/* ARTICLE  */}
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
                                <QuizLesson lessonId={activeLessonId} lessonTitle={activeLessonTitle} />
                            </>
                        )}

                        {/* 4. LOADING STATE */}
                        {contentLoading && (
                            <div className="w-full aspect-video bg-black flex items-center justify-center animate-pulse">
                                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                            </div>
                        )}
                    </div>

                    {/* ====== Bottom Control Bar ====== */}
                    <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-[#1A1A1A] border-t border-gray-200 dark:border-[#2a2a2e]">
                        <div className="min-w-0">
                            {activeLessonTitle ? (
                                <>
                                    {/* <h2 className="text-base font-bold text-gray-800 dark:text-[#E0E0E0] truncate">
                                        {activeLessonTitle}
                                    </h2>
                                    <p className="text-xs text-gray-400 dark:text-[#d0d0E0] mt-0.5 truncate">
                                        {courseTitle}
                                    </p> */}
                                </>
                            ) : (
                                <p className="text-gray-400 dark:text-[#d0d0E0] text-sm">
                                    {contentLoading ? 'Loading course...' : 'Select a lesson to begin'}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={() => setIsSidebarOpen(prev => !prev)}
                            className="hidden md:flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-[#d0d0E0] hover:text-gray-800 dark:hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2e] shrink-0 ml-3"
                        >
                            {isSidebarOpen
                                ? <><PanelRightClose size={16} /> Hide Sidebar</>
                                : <><PanelRightOpen size={16} /> Show Sidebar</>
                            }
                        </button>
                    </div>
                </div>

                {/* ====== Right: Course Content Sidebar ====== */}
                {isSidebarOpen && (
                    <div className="hidden md:flex w-[340px] shrink-0 flex-col border-l border-gray-200 dark:border-[#2a2a2e] overflow-hidden">
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
                                    onClose={() => setIsSidebarOpen(false)}
                                    courseTitle={courseTitle}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}