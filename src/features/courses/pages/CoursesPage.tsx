import AchievementsImg from '../../../assets/Achievements.png';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import CourseCard from '../../../shared/components/CourseCard';
import Footer from '../../../shared/components/Footer';
import { SearchBar } from '../components/SearchBar';
import { useState } from 'react';
import { useGetCourses } from '../api/useGetAllCourses';
import { useAuth } from '../../auth/hooks/useAuth';
import Pagination from '../../dashboard/components/Pagination';

// --- Types for API consistency ---
export interface Tag {
    id: number;
    name: string;
}

// interface EnrolledCourse {
//     id: string;
//     title: string;
//     lessonName: string;
//     currentLecture: number;
//     image: string;
//     time: Date | string;
// }

const CoursesPage = () => {
    const { user } = useAuth()
    const [page, setPage] = useState(1);
    
    // يفضل لو الـ hook بيرجع isLoading نستخدمها لعرض حالة تحميل (Loading State)
    const {
        data: coursesData,
        // isLoading, // إذا كانت متاحة يمكنك استخدامها
    } = useGetCourses(page);

    // const enrolledCourses: EnrolledCourse[] = [
    //     { id: '1', title: 'Fundamentals of UI Design', lessonName: '1. Introduction', time: '1m', currentLecture: 1, image: 'https://placehold.co/400x300/000/fff' },
    //     { id: '2', title: 'Fundamentals of UI Design', lessonName: '1. Introduction', time: '1m', currentLecture: 1, image: 'https://placehold.co/400x300/000/fff' },
    //     { id: '3', title: 'Fundamentals of UI Design', lessonName: '1. Introduction', time: '1m', currentLecture: 1, image: 'https://placehold.co/400x300/000/fff' },
    //     { id: '4', title: 'Fundamentals of UI Design', lessonName: '1. Introduction', time: '1m', currentLecture: 1, image: 'https://placehold.co/400x300/000/fff' },
    // ];

    return (
        <div className="min-h-screen bg-[#F8FAFC]  dark:bg-[#0e0e10] font-inter">

            {/* --- PART 1: Top Navigation --- */}
            <SearchBar />

            <main className="max-w-[1450px] mx-auto p-4 md:p-8">

                {/* --- PART 2: Welcome & Hero Banner --- */}
                <div className="flex items-center gap-3 mb-8">
                    <img src="https://avatar.iran.liara.run/public/30" className="w-10 h-10 rounded-full border-2 border-[#0061EF]  object-cover p-0.5 " alt="Profile" />
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Welcome back, {user?.firstName} {user?.lastName}</h2>
                </div>
                <div className="mx-auto max-w-[1450px]">
                    <div className="rounded-[2rem]  bg-[#0061EF] px-6 lg:px-12 py-1 flex flex-col lg:flex-row items-center gap-12 text-white">
                        <div className="flex-1 text-center lg:text-left">
                            <h2 className="text-3xl lg:text-[44px] font-bold mb-6">Develop Your Skills</h2>
                            <p className="text-lg lg:text-[24px]">Enhance your skills by watching the courses in all fields,
                                sharing your way with others in one community.
                            </p>
                        </div>

                        <div className="flex justify-center w-full lg:w-auto p-2">
                            <img src={AchievementsImg} alt="Achievements" className="w-[300px] lg:max-w-xs" />
                        </div>
                    </div>
                </div>

                {/* --- PART 4 & 5: Course Grids --- */}
                <div className=" flex flex-col lg:gap-10 gap-24 mt-6">

                    {/* All Courses / Recommended */}
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-8">All Courses</h2>
                        
                        {/* يمكنك إضافة حالة تحميل هنا إذا أردت: {isLoading && <p>Loading...</p>} */}
                        
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
                                        rating: course.rating
                                    }}
                                />
                            ))}
                        </div>
                    </section>

                    {/* --- Pagination Controls --- */}
                    {/* ⭐ التأكد من أن coursesData موجود فعلياً قبل محاولة رسم الـ Pagination */}
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