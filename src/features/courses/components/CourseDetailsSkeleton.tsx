import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const CourseDetailsSkeleton = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0e0e10] font-inter animate-pulse">
            {/* --- Hero Section Skeleton --- */}
            <div className="relative bg-[#1a1a1a] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-black via-black/80 to-transparent z-10"></div>
                <div className="absolute inset-0 w-full h-full bg-slate-800 opacity-50"></div>

                <div className="relative z-20 max-w-[1450px] mx-auto px-4 md:px-8 py-12 lg:py-16">
                    <button
                        onClick={() => navigate(-1)} 
                        className="flex p-2 items-center gap-2 text-slate-300 hover:text-white mb-8 transition-colors rounded-xl hover:bg-blue-600 w-max"
                    >
                        <ArrowLeft size={20} className="rtl:rotate-180" />
                        <span className="font-medium">{t('courseDetails.backToCourses')}</span>
                    </button>

                    <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
                        <div className="flex-1 max-w-3xl w-full">
                            {/* Tags */}
                            <div className="flex gap-3 mb-4">
                                <div className="h-6 w-16 bg-slate-700 rounded"></div>
                                <div className="h-6 w-20 bg-slate-700 rounded"></div>
                            </div>

                            {/* Title */}
                            <div className="h-12 w-3/4 bg-slate-700 rounded mb-4"></div>
                            <div className="h-12 w-1/2 bg-slate-700 rounded mb-6"></div>

                            {/* Description */}
                            <div className="h-4 w-full bg-slate-700 rounded mb-2"></div>
                            <div className="h-4 w-5/6 bg-slate-700 rounded mb-6"></div>

                            {/* Stats */}
                            <div className="flex flex-wrap items-center gap-6">
                                <div className="h-6 w-24 bg-slate-700 rounded"></div>
                                <div className="h-6 w-32 bg-slate-700 rounded"></div>
                                <div className="h-6 w-28 bg-slate-700 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Main Content Grid Skeleton --- */}
            <main className="max-w-[1450px] mx-auto px-4 md:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-8 flex flex-col gap-10">
                        {/* Description Section */}
                        <section>
                            <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
                            <div className="flex flex-col gap-2">
                                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
                                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
                                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                            </div>
                        </section>

                        {/* What You'll Learn Section */}
                        <section className="bg-white border border-slate-200 p-6 dark:bg-[#1A1A1A] dark:border-[#2a2a2e] rounded-[1rem]">
                            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0"></div>
                                        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Course Content Section */}
                        <section>
                            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
                            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>

                            <div className="border border-slate-200 dark:border-[#2a2a2e] rounded-[1rem] overflow-hidden bg-white dark:bg-[#1A1A1A]">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="border-b border-slate-100 dark:border-[#2a2a2e] p-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3 w-1/2">
                                            <div className="h-5 w-5 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                            <div className="h-5 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
                                        </div>
                                        <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded hidden sm:block"></div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN (Sticky Sidebar) */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 flex flex-col gap-6">
                            
                            {/* Instructor Card */}
                            <div className="bg-white border border-slate-200 rounded-[1rem] p-6 shadow-sm dark:bg-[#1A1A1A] dark:border-[#2a2a2e]">
                                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0"></div>
                                    <div className="flex flex-col gap-2 flex-1">
                                        <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                        <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
                                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
                                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
                                </div>
                            </div>

                            {/* Course Info Card */}
                            <div className="bg-white border border-slate-200 rounded-[1rem] p-6 shadow-sm dark:bg-[#1A1A1A] dark:border-[#2a2a2e]">
                                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
                                <div className="flex flex-col gap-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-[#2a2a2e] last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <div className="h-5 w-5 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                            </div>
                                            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                        </div>
                                    ))}
                                </div>
                                {/* Enroll button skeleton */}
                                <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl mt-8"></div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CourseDetailsSkeleton;
