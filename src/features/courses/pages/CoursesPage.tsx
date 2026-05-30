import AchievementsImg from '../../../assets/Achievements.png';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import CourseCard from '../../../shared/components/CourseCard';
import Footer from '../../../shared/components/footerauth';
import { SearchBar } from '../components/SearchBar';
import { useState } from 'react';
import { useGetCourses } from '../api/useGetAllCourses';
import { useAuth } from '../../auth/hooks/useAuth';
import Pagination from '../../dashboard/components/Pagination';
import { useTranslation } from 'react-i18next';

// --- Types for API consistency ---
export interface Tag {
    id: number;
    name: string;
}

const CoursesPage = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [page, setPage] = useState(1);

    const {
        data: coursesData,
    } = useGetCourses(page);

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0e0e10] font-inter">

            {/* --- PART 1: Top Navigation --- */}
            <SearchBar />

            <main className="max-w-[1450px] mx-auto p-4 md:p-8">

                {/* --- PART 2: Welcome & Hero Banner --- */}
                <div className="flex items-center gap-3 mb-8">
                    <img src={user?.imageUrl} className="w-10 h-10 rounded-full border-2 border-[#0061EF] object-cover p-0.5" alt="Profile" />
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                        {t('courses.welcomeBack', { name: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() })}
                    </h2>
                </div>

                <div className="mx-auto max-w-[1450px]">
                    <div className="rounded-[2rem] bg-[#0061EF] px-6 lg:px-12 py-1 flex flex-col lg:flex-row items-center gap-12 text-white">
                        <div className="flex-1 text-center lg:text-start">
                            <h2 className="text-3xl lg:text-[44px] font-bold mb-6">{t('courses.heroTitle')}</h2>
                            <p className="text-lg lg:text-[24px]">
                                {t('courses.heroDescription')}
                            </p>
                        </div>
                        <div className="flex justify-center w-full lg:w-auto p-2">
                            <img src={AchievementsImg} alt="Achievements" className="w-[300px] lg:max-w-xs" />
                        </div>
                    </div>
                </div>

                {/* --- PART 4 & 5: Course Grids --- */}
                <div className="flex flex-col lg:gap-10 gap-24 mt-6">

                    {/* All Courses */}
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-8">{t('courses.allCourses')}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {coursesData?.items?.map((course: any) => (
                                <CourseCard
                                    key={course.keyId ?? ''}
                                    course={{
                                        keyId: course.keyId,
                                        imageUrl: course.imageUrl,
                                        tags: course.tags || [],
                                        title: course.title,
                                        instructorName: course.instructorName,
                                        totalReviews: course.totalReviews,
                                        hours: course.hours,
                                        price: course.price,
                                        isEnrolled: course.isEnrolled,
                                        isBookmarked: course.isBookmarked,
                                        isEnrollmentOpen: course.isEnrollmentOpen,
                                        numberOfLessons: course.numberOfLessons,
                                        rating: course.rating,
                                        progressPercentage: course.progressPercentage,
                                    }}
                                />
                            ))}
                        </div>
                    </section>

                    {/* --- Pagination Controls --- */}
                    {coursesData && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <Pagination
                                currentPage={coursesData.pageNumber || 1}
                                totalPages={coursesData.totalPages || 1}
                                hasNextPage={coursesData.hasNextPage || false}
                                hasPreviousPage={coursesData.hasPreviousPage || false}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </div>
            </main>

            {/* --- PART 6: Footer --- */}
            <Footer />
        </div>
    );
};

export default CoursesPage;
