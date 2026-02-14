import {
    ChevronLeft,
    ChevronRight,
    
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import AchievementsImg from '../../../assets/Achievements.png';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import CourseCard from '../../../shared/components/CourseCard';
import LearningCard from '../components/LearningCard';
import Footer from '../../../shared/components/Footer';
import { SearchBar } from '../components/SearchBar';
import { useState } from 'react';
import { useGetCourses } from '../api/useGetAllCourses';
import { useNavigate } from 'react-router-dom';

// --- Types for API consistency ---
export interface Tag {
    id: number;
    name: string;
}
interface Course {
    id: string;
    image: string;
    category: Tag[];
    title: string;
    instructor: string;
    rating: number;
    duration: string;
    lectures: number;
    price: number;
    enrolled: boolean,
    bookMarked: boolean,
}

interface EnrolledCourse {
    id: string;
    title: string;
    lessonName: string;
    currentLecture: number;
    image: string;
    time: Date | string;
}



const CoursesPage = () => {
    const [page, setPage] = useState(1);
    const navigate = useNavigate();
    const {
        data: coursesData,
    } = useGetCourses(page);

    const handleNextPage = () => {
        if (coursesData?.hasNextPage) {
            setPage(old => old + 1);
        }
    };
    const handlePrevPage = () => {
        setPage(old => Math.max(old - 1, 1));
    };

    const enrolledCourses: EnrolledCourse[] = [
        { id: '1', title: 'Fundamentals of UI Design', lessonName: '1. Introduction', time: '1m', currentLecture: 1, image: 'https://placehold.co/400x300/000/fff' },
        { id: '2', title: 'Fundamentals of UI Design', lessonName: '1. Introduction', time: '1m', currentLecture: 1, image: 'https://placehold.co/400x300/000/fff' },
        { id: '3', title: 'Fundamentals of UI Design', lessonName: '1. Introduction', time: '1m', currentLecture: 1, image: 'https://placehold.co/400x300/000/fff' },
        { id: '4', title: 'Fundamentals of UI Design', lessonName: '1. Introduction', time: '1m', currentLecture: 1, image: 'https://placehold.co/400x300/000/fff' },
    ];

    const allCourses: Course[] = Array(12).fill({
        id: 'c1',
        image: 'https://placehold.co/600x400/2563eb/fff?text=Python+Bootcamp',
        category: [{
            id:1,
            name:"ai"
        }],
        title: 'Complete Machine Learning & Data Science Bootcamp',
        instructor: 'Angela Yu',
        rating: 4.8,
        duration: '45h',
        lectures: 138,
        price: 'E.L 350',
        enrolled: true,
        bookMarked: false,
        
    });


    return (
        <div className="min-h-screen bg-[#F8FAFC] font-inter">

            {/* --- PART 1: Top Navigation --- */}
            <SearchBar />

            <main className="max-w-[1450px] mx-auto p-4 md:p-8">

                {/* --- PART 2: Welcome & Hero Banner --- */}
                <div className="flex items-center gap-3 mb-8">
                    <img src="https://avatar.iran.liara.run/public/30" className="w-10 h-10 rounded-full border-2 border-[#0061EF]  object-cover p-0.5 " alt="Profile" />
                    <h2 className="text-xl font-bold text-slate-800">Welcome back, Mahmoud</h2>
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

                {/* --- PART 3: My Learning Swiper Section --- */}
                <div className="mb-16 relative">
                    <div className="flex items-center justify-between mb-6 mt-6">
                        <h2 className="text-xl font-bold text-slate-800">My Learning</h2>
                        <button onClick={() => navigate('/my-learning')} className="text-[#0061EF] font-bold text-sm hover:underline">
                            View All
                        </button>
                    </div>

                    <div className="px-10">
                        <Swiper
                            modules={[Navigation]}
                            spaceBetween={20}
                            slidesPerView={1}
                            navigation={{
                                prevEl: '.swiper-prev-learning',
                                nextEl: '.swiper-next-learning',
                            }}
                            breakpoints={{
                                640: { slidesPerView: 2 },
                                1024: { slidesPerView: 3 },
                            }}
                            className="relative"
                        >
                            {enrolledCourses.map((course) => (
                                <SwiperSlide key={course.id}>
                                    <LearningCard course={course} />
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {/* Custom Navigation Arrows */}
                        <button className="swiper-prev-learning absolute left-0 top-1/2 mt-7 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0061EF] hover:bg-blue-500 text-white border-slate-100 flex items-center justify-center  z-10   transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            <ChevronLeft size={20} />
                        </button>
                        <button className="swiper-next-learning absolute right-0 top-1/2 mt-7 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0061EF] hover:bg-blue-500 text-white border-slate-100 flex items-center justify-center  z-10  transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* --- PART 4 & 5: Course Grids --- */}
                <div className=" flex flex-col lg:gap-10 gap-24">
                    {/* Recently Searched */}
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-8 ">Recently Searched</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {allCourses.slice(0, 3).map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    </section>


                    {/* All Courses / Recommended */}
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-8">All Courses</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {coursesData?.items?.map((course) => (

                                <CourseCard
                                    key={course.keyId}
                                    course={{
                                        id: course.keyId,
                                        image: course.imageUrl,
                                        category: course.tags || [],
                                        title: course.title,
                                        instructor: course.instructorName,
                                        rating: course.rating,
                                        duration: '10h',
                                        lectures: 10,
                                        price: course.price,
                                        enrolled: course.isEnrolled,
                                        bookMarked: course.isBookmarked

                                    }}
                                />
                            ))}
                        </div>
                    </section>
                    {/* --- Pagination Controls --- */}
                    <div className="flex justify-center items-center gap-4 mt-8">
                        <button
                            onClick={handlePrevPage}
                            disabled={!coursesData?.hasPreviousPage}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#0061EF] text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={28} strokeWidth={2.5} />
                        </button>

                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#A0A0A0] text-white font-bold text-xl">
                            {page}
                        </div>

                        <button
                            onClick={handleNextPage}
                            disabled={!coursesData?.hasNextPage}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#0061EF] text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight size={28} strokeWidth={2.5} />
                        </button>

                    </div>
                </div>
            </main>
            {/* --- PART 6: Footer --- */}
            <Footer />
        </div>
    );
};

export default CoursesPage;