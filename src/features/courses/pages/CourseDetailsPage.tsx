import { useState } from 'react';
import {
    Star,
    Users,
    Clock,
    CheckCircle2,
    PlayCircle,
    ChevronDown,
    ChevronUp,
    BarChart,
    Calendar,
    Award,
    ArrowLeft,
    Bookmark,
    X,
    Edit3,
    FileText,
    Lock
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../../../shared/components/Footer';
import { CommentsSection } from '../../../shared/components/CommentsSection';
import { useGetCourseMetaDataById } from '../api/useGetCourseById';
import { useBookMark } from '../api/useBookMark';
import { useGetInstById } from '../../../shared/api/useGetInsApi';
import { useGetCourseReviews, useAddCourseReview } from '../api/useCourseReviews';
import { useGetCoursesContent } from '../api/useGetAllCourses';
import useEnroll from '../api/useEnrolle';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';



const isUserLoggedIn = (): boolean => {
    try {
        return !!localStorage.getItem("user") || !!localStorage.getItem("token");
    } catch {
        return false;
    }
};

const formatDuration = (durationParam: string | number | null | undefined, t: TFunction) => {
    if (!durationParam || durationParam === "00:00:00") return null;

    let totalSeconds = 0;

    // إذا كانت القيمة بالشكل HH:MM:SS أو HH:MM:SS.fff
    if (typeof durationParam === 'string' && durationParam.includes(':')) {
        const parts = durationParam.split(':');
        if (parts.length === 3) {
            const hours = parseInt(parts[0], 10);
            const minutes = parseInt(parts[1], 10);
            const seconds = Math.floor(parseFloat(parts[2]));
            totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
        }
    } else {
        // دعم للأرقام (ثواني) في حالة كان الـ API يرجع ثواني
        totalSeconds = Number(durationParam);
    }

    if (isNaN(totalSeconds) || totalSeconds <= 0) return null;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    if (hours > 0) {
        return minutes > 0
            ? `${t('courseDetails.hours', { count: hours })} ${t('courseDetails.minutes', { count: minutes })}`
            : t('courseDetails.hours', { count: hours });
    }
    if (minutes > 0) {
        return seconds > 0
            ? `${t('courseDetails.minutes', { count: minutes })} ${t('courseDetails.seconds', { count: seconds })}`
            : t('courseDetails.minutes', { count: minutes });
    }
    return t('courseDetails.seconds', { count: seconds });
};

const CourseDetailsPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [openSection, setOpenSection] = useState<number | null>(0);
    const { courseId } = useParams();
    const isLoggedIn = isUserLoggedIn();
    const { mutate } = useEnroll(courseId!)


    // --- Data Fetching ---
    const { data: CourseContent } = useGetCoursesContent(courseId!);
    const { data: courseMetaData } = useGetCourseMetaDataById(courseId!);
    const { mutate: Bookmarked, isPending: bookMarkPending } = useBookMark();
    const { data: InstructorData } = useGetInstById(courseId!);

    // --- Reviews Fetching & Mutation ---
    const { data: reviewsData } = useGetCourseReviews(courseId!);
    const { mutate: submitReview, isPending: isSubmittingReview } = useAddCourseReview(courseId!);

    // --- Review Modal State ---
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");

    const handleAddBookmark = () => {
        if (bookMarkPending) return;
        Bookmarked(courseId!);
    };

    const toggleSection = (id: number) => {
        setOpenSection(openSection === id ? null : id);
    };

    const handleReviewSubmit = () => {
        if (rating === 0) return;
        submitReview(
            { rating, comment: reviewComment.trim() || null },
            {
                onSuccess: () => {
                    setIsReviewModalOpen(false);
                    setRating(0);
                    setReviewComment("");
                }
            }
        );
    };

    const getReviewsArray = (data: any) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.items)) return data.items;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data.reviews)) return data.reviews;
        return [];
    };

    const safeReviewsArray = getReviewsArray(reviewsData);

    const formattedReviews = safeReviewsArray.map((r: any) => ({
        id: r.id?.toString() || Math.random().toString(),
        name: r.userName || r.studentName || t('courseDetails.student'),
        feedback: r.comment || t('courseDetails.noComment')
    }));

    // --- Mock Data ---
    const course = {
        lastUpdated: t('courseDetails.lastUpdatedValue'),
    };
    const handleEnroll = (courseId: string) => {

        mutate(courseId);
    };


    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0e0e10] font-inter">

            {/* --- Hero Section --- */}
            <div className="relative bg-[#1a1a1a] text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-black via-black/80 to-transparent z-10"></div>
                <img
                    src={courseMetaData?.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1470&q=80'}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                />

                <div className="relative z-20 max-w-[1450px] mx-auto px-4 md:px-8 py-12 lg:py-16">
                    <button
                        onClick={() => navigate(-1)} className="flex p-2 items-center gap-2 text-slate-300 hover:text-white mb-8 transition-colors rounded-xl hover:bg-blue-600">
                        <ArrowLeft size={20} className="rtl:rotate-180" />
                        <span className="font-medium">{t('courseDetails.backToCourses')}</span>
                    </button>

                    <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
                        <div className="flex-1 max-w-3xl">
                            <div className="flex gap-3 mb-4">
                                {courseMetaData?.tags?.map((tag: any, id: number) => (
                                    <span key={id} className="bg-[#0061EF] text-xs font-bold px-3 py-1 rounded text-white">
                                        {tag.name}
                                    </span>
                                ))}
                            </div>

                            <h1 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight">
                                {courseMetaData?.title}
                            </h1>
                            <p className="text-lg text-slate-300 mb-6">
                                {courseMetaData?.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300">
                                <div className="flex items-center gap-1 text-yellow-400">
                                    <span className="font-bold text-lg">{courseMetaData?.rating || "0.0"}</span>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} fill={i < Math.round(courseMetaData?.rating || 0) ? "currentColor" : "none"} />
                                        ))}
                                    </div>
                                    <span className="text-slate-400 underline ms-1 dark:text-[#d0d0E0]">
                                        ({t('courseDetails.ratings', { count: courseMetaData?.totalReviews || 0 })})
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users size={18} />
                                    <span className="dark:text-[#d0d0E0]">{t('courseDetails.students', { count: courseMetaData?.numberOfStudents || 0 })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={18} />
                                    <span className="dark:text-[#d0d0E0]">{t('courseDetails.totalHours', { count: CourseContent?.totalHours || 0 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Main Content Grid --- */}
            <main className="max-w-[1450px] mx-auto px-4 md:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-8 flex flex-col gap-10">
                        {/* Description */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-4 dark:text-[#E0E0E0]">{t('courseDetails.description')}</h2>
                            <p className="text-slate-600 dark:text-[#d0d0E0] leading-relaxed">
                                {courseMetaData?.description}
                            </p>
                        </section>

                        {/* What You'll Learn */}
                        <section className="bg-white border border-slate-200 p-6 dark:bg-[#1A1A1A] dark:border-[#2a2a2e] rounded-[1rem]">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-[#FAFAFA] mb-6">{t('courseDetails.whatYouWillLearn')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {courseMetaData?.learningOutcomes?.map((item: string, index: number) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <CheckCircle2 className="text-[#0061EF] shrink-0 mt-0.5" size={20} />
                                        <span className="text-slate-600 dark:text-[#d0d0E0] text-sm font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Course Content */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2 dark:text-[#E0E0E0]">{t('courses.courseContent')}</h2>
                            <p className="text-slate-500 text-sm mb-6 dark:text-[#E0E0E0]">
                                {t('courseDetails.sectionsLessons', { sections: CourseContent?.sections?.length || 0, lessons: CourseContent?.totalLessons || 0 })}
                            </p>

                            <div className="border border-slate-200 dark:border-[#2a2a2e] rounded-[1rem] overflow-hidden bg-white dark:bg-[#1A1A1A]">
                                {CourseContent?.sections?.map((section: any, idx: number) => (
                                    <div key={section.id || idx} className="border-b border-slate-100 dark:border-[#2a2a2e] last:border-0">
                                        <button
                                            onClick={() => toggleSection(section.id)}
                                            className="w-full flex items-center justify-between p-4 bg-[#F8FAFC] dark:bg-[#1A1A1A] hover:bg-slate-100 dark:hover:bg-[#2a2a2e] transition-colors text-start"
                                        >
                                            <div className="flex items-center gap-3">
                                                {openSection === section.id
                                                    ? <ChevronUp size={20} className="text-slate-600 dark:text-[#d0d0E0]" />
                                                    : <ChevronDown size={20} className="text-slate-600 dark:text-[#d0d0E0]" />
                                                }
                                                <span className="font-bold text-slate-800 dark:text-[#E0E0E0]">
                                                    {section.title || t('courseDetails.section', { number: section.position || idx + 1 })}
                                                </span>
                                            </div>
                                            <span className="text-xs text-slate-500 dark:text-[#d0d0E0] hidden sm:block">
                                                {t('courseDetails.lessons', { count: section.lessonsCount || section.lessons?.length || 0 })}
                                            </span>
                                        </button>

                                        {openSection === section.id && (
                                            <div className="p-4 bg-white dark:bg-[#1A1A1A]">
                                                <ul className="flex flex-col gap-3">
                                                    {section.lessons?.map((item: any, itemIdx: number) => (
                                                        <li key={item.id || itemIdx} className="flex items-center justify-between text-sm text-slate-600 dark:text-[#d0d0E0] ms-8">
                                                            <div className="flex items-center gap-3">
                                                                {/* ⭐ تفريق الأيقونات بناءً على النوع */}
                                                                {item.isLocked ? (
                                                                    <Lock size={16} className="text-slate-400 dark:text-[#d0d0E0]" />
                                                                ) : item.type === "Quiz" || item.type === 3 || item.exam ? (
                                                                    <FileText size={16} className="text-yellow-500" />
                                                                ) : item.type === "Article" || item.type === 2 ? (
                                                                    <FileText size={16} className="text-blue-500" />
                                                                ) : (
                                                                    <PlayCircle size={16} className="text-[#0061EF]" />
                                                                )}
                                                                <span>{item.title || t('courseDetails.lesson', { number: item.orderIndex || itemIdx + 1 })}</span>
                                                            </div>

                                                            {/* ⭐ عرض الوقت الخاص بالامتحان أو الفيديو متضمن الوحدة */}
                                                            {item.exam?.durationInMinutes ? (
                                                                <span className="text-slate-400 dark:text-[#d0d0E0] font-medium text-sm">
                                                                    {t('courseDetails.minutes', { count: item.exam.durationInMinutes })}
                                                                </span>
                                                            ) : (item.type === "Video" || item.type === 1 || !item.type) && formatDuration(item.duration, t) ? (
                                                                <span className="text-slate-400 dark:text-[#d0d0E0] font-medium text-sm">
                                                                    {formatDuration(item.duration, t)}
                                                                </span>
                                                            ) : null}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Prerequisites */}
                        <section className="bg-white border border-slate-200 p-6 rounded-[1rem] dark:bg-[#1A1A1A] dark:border-[#2a2a2e]">
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 dark:text-[#E0E0E0]">
                                <div className="bg-yellow-100 dark:bg-yellow-500/20 p-1 rounded-full">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                </div>
                                {t('courseDetails.prerequisites')}
                            </h2>
                            <p className="text-slate-500 text-sm mb-4 dark:text-[#E0E0E0]">{t('courseDetails.beforeCourse')}</p>
                            <ul className="flex flex-col gap-3">
                                {courseMetaData?.prerequisites?.map((prereq: string, i: number) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-600 dark:text-[#d0d0E0] text-sm">
                                        <CheckCircle2 size={18} className="text-yellow-500" />
                                        <span>{prereq}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>

                    {/* RIGHT COLUMN (Sidebar) */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 flex flex-col gap-6">

                            {/* Instructor Card */}
                            <div className="bg-white border border-slate-200 rounded-[1rem] p-6 shadow-sm dark:bg-[#1A1A1A] dark:border-[#2a2a2e]">
                                <h3 className="font-bold text-slate-800 mb-4 dark:text-[#E0E0E0]">{t('courseDetails.instructor')}</h3>
                                <div className="flex items-center gap-4 mb-4">
                                    <img src={InstructorData?.imageUrl || `https://ui-avatars.com/api/?name=${InstructorData?.name || 'Instructor'}&background=0061EF&color=fff`} alt={t('courseDetails.instructor')} className="w-16 h-16 rounded-full object-cover border-2 border-[#0061EF] p-0.5" />
                                    <div>
                                        <h4 className="font-bold text-[#0061EF] text-lg">{InstructorData?.name || t('courseDetails.instructorName')}</h4>
                                        <p className="text-xs text-slate-500 dark:text-[#d0d0E0]">{InstructorData?.headline || t('courseDetails.instructor')}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 text-sm text-slate-600 mb-2">
                                    <div className="flex items-center gap-2 dark:text-[#d0d0E0]">
                                        <Users size={16} className="text-slate-400 dark:text-[#d0d0E0]" />
                                        <span>{InstructorData?.totalStudents || 0} {t('courseDetails.studentsLabel')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 dark:text-[#d0d0E0]">
                                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                        <span>{InstructorData?.rating || 0} {t('courseDetails.instructorRating')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 dark:text-[#d0d0E0]">
                                        <PlayCircle size={16} className="text-slate-400 dark:text-[#d0d0E0]" />
                                        <span>{InstructorData?.totalCourses || 0} {t('courseDetails.courses')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Course Info Card */}
                            <div className="bg-white border border-slate-200 rounded-[1rem] p-6 shadow-sm dark:bg-[#1A1A1A] dark:border-[#2a2a2e]">
                                <h3 className="font-bold text-slate-800 mb-6 dark:text-[#E0E0E0]">{t('courseDetails.courseInfo')}</h3>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-[#d0d0E0]">
                                            <BarChart size={20} className="text-slate-400 dark:text-[#d0d0E0]" />
                                            <span>{t('courseDetails.level')}</span>
                                        </div>
                                        <span className="font-semibold text-slate-800 dark:text-[#d0d0E0]">{t('courseDetails.intermediate')}</span>
                                    </div>
                                    <div className="border-b border-slate-100 dark:border-[#2a2a2e]"></div>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-[#d0d0E0]">
                                            <Calendar size={20} className="text-slate-400 dark:text-[#d0d0E0]" />
                                            <span>{t('courseDetails.lastUpdated')}</span>
                                        </div>
                                        <span className="font-semibold text-slate-800 dark:text-[#E0E0E0]">{course.lastUpdated}</span>
                                    </div>
                                    <div className="border-b border-slate-100 dark:border-[#2a2a2e]"></div>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-[#d0d0E0]">
                                            <Award size={20} className="text-slate-400 dark:text-[#d0d0E0]" />
                                            <span>{t('courseDetails.certificate')}</span>
                                        </div>
                                        <span className="font-semibold text-slate-800 dark:text-[#E0E0E0]">{t('common.yes')}</span>
                                    </div>
                                    <div className="border-b border-slate-100 dark:border-[#2a2a2e]"></div>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-[#d0d0E0]">
                                            <Clock size={20} className="text-slate-400 dark:text-[#d0d0E0]" />
                                            <span>{t('courseDetails.duration')}</span>
                                        </div>
                                        <span className="font-semibold text-slate-800 dark:text-[#E0E0E0]">{t('courseDetails.hours', { count: CourseContent?.totalHours || 0 })}</span>
                                    </div>
                                </div>

                                {courseMetaData?.isEnrolled ? (
                                    <div className='flex justify-center items-center gap-4'>
                                        <button onClick={() => navigate(`/courses/${courseId}/learn`)} className="w-full mt-8 bg-[#0061EF] text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg dark:shadow-sm shadow-blue-200">
                                            {t('courses.goToCourse')}
                                        </button>
                                        <button
                                            onClick={handleAddBookmark}
                                            className={`mt-6 p-2 rounded-full shadow-md transition-all duration-300 active:scale-90 ${courseMetaData.isBookmarked
                                                ? 'bg-[#0066FF] text-white'
                                                : 'bg-white/90 dark:bg-[#2a2a2e] backdrop-blur-sm text-slate-400 hover:text-[#0066FF]'
                                                }`}
                                        >
                                            <Bookmark
                                                size={16}
                                                fill={courseMetaData.isBookmarked ? "currentColor" : "none"}
                                            />
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => handleEnroll(courseId!)} className="w-full mt-8 bg-[#00059f] text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-[#001123] dark:text-[#E0E0E0]">
                                        {t('courseDetails.enrollFor', { price: courseMetaData?.price === 0 ? t('common.free') : t('courses.price', { price: courseMetaData?.price }) })}
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            {/* --- Student Opinions (Footer Section) --- */}
            <div className='bg-[#191919]'>
                <div className='max-w-[1450px] mx-auto px-4 md:px-8 py-12 flex flex-col'>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <h1 className="bg-[linear-gradient(120deg,_#4262E4_32%,_#3995B9_69%)] bg-clip-text text-transparent py-3 text-2xl md:text-4xl lg:text-[48px] font-bold text-center md:text-start leading-tight">
                            {t('courseDetails.addOpinion')}
                        </h1>
                        {isLoggedIn && courseMetaData?.isEnrolled ? (
                            <button
                                onClick={() => setIsReviewModalOpen(true)}
                                className="flex items-center gap-2 bg-[#0061EF] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/30"
                            >
                                <Edit3 size={18} /> {t('courseDetails.writeReview')}
                            </button>
                        ) : null}

                    </div>
                </div>
            </div>

            <div className='bg-[#191919]'>
                <div className='max-w-[1450px] mx-auto px-4 md:px-8 py-12 flex flex-col'>
                    {formattedReviews.length > 0 && (
                        <div>
                            <h1 className="bg-[linear-gradient(120deg,_#4262E4_32%,_#3995B9_69%)] bg-clip-text text-transparent text-xl md:text-4xl lg:text-[48px] font-bold text-center leading-tight py-3">
                                {t('courseDetails.studentOpinion')}
                            </h1>
                            <CommentsSection comments={formattedReviews} />
                        </div>
                    )}
                </div>
            </div>

            <Footer />

            {/* --- Add Review Modal --- */}
            {isReviewModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1c1c1f] rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
                        <button
                            onClick={() => setIsReviewModalOpen(false)}
                            className="absolute end-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">{t('courseDetails.leaveReview')}</h2>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t('courseDetails.rateExperience')} <span className="text-red-500">*</span></label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        className="transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <Star
                                            size={32}
                                            className={`${(hoveredRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'} transition-colors`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t('courseDetails.commentOptional')}</label>
                            <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder={t('courseDetails.commentPlaceholder')}
                                className="w-full bg-slate-50 dark:bg-[#0e0e10] border border-slate-200 dark:border-[#2a2a2e] rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-28"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsReviewModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2a2a2e] rounded-xl transition-colors"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleReviewSubmit}
                                disabled={rating === 0 || isSubmittingReview}
                                className="px-5 py-2.5 text-sm font-medium bg-[#0061EF] text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmittingReview ? t('common.submitting') : t('courseDetails.submitReview')}
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default CourseDetailsPage;
