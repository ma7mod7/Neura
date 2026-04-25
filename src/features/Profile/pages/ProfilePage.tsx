import { useState } from 'react';
import {
    GraduationCap,
    Award,
    Loader2,
    Clock,
    Search,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import NavBar from '../../../shared/components/NavBar';
import CourseCard from '../../../shared/components/CourseCard';
import Footer from '../../../shared/components/Footer';
import SideBar from '../components/SideBar';
import { useProfileCourses } from '../hooks/useProfileCourses';

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) => {
    const colors: Record<string, { border: string, text: string, iconBg: string, bgColor: string }> = {
        blue: { border: 'border-blue-200 dark:border-blue-900', text: 'text-blue-600', iconBg: 'text-blue-600', bgColor: "bg-blue-50 dark:bg-blue-900/20" },
        green: { border: 'border-green-200 dark:border-green-900', text: 'text-green-600', iconBg: 'text-green-600', bgColor: "bg-green-50 dark:bg-green-900/20" },
        purple: { border: 'border-purple-200 dark:border-purple-900', text: 'text-purple-600', iconBg: 'text-purple-600', bgColor: "bg-purple-50 dark:bg-purple-900/20" },
        orange: { border: 'border-orange-200 dark:border-orange-900', text: 'text-orange-600', iconBg: 'text-orange-600', bgColor: "bg-orange-50 dark:bg-orange-900/20" },
    };

    const theme = colors[color];

    return (
        <div className={`${theme.bgColor} p-5 rounded-2xl border ${theme.border} shadow-sm relative overflow-hidden h-36 flex flex-col justify-between`}>
            <h3 className={`font-semibold ${theme.text}`}>{label}</h3>
            <div className="flex items-end justify-between">
                <span className={`text-4xl font-bold ${theme.text}`}>{value}</span>
                <Icon size={36} className={`${theme.iconBg}`} strokeWidth={2.2} />
            </div>
        </div>
    );
};

const ProfilePage = () => {
    // States for Tabs, Pagination, and Search
    const [activeTab, setActiveTab] = useState('My Courses');
    const [pageNumber, setPageNumber] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // React Query Hook
    const { data, isLoading, isError } = useProfileCourses(activeTab, pageNumber, searchTerm);
    console.log(data)

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setPageNumber(1);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0e0e10] font-inter">
            <NavBar />

            <main className="mx-auto p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    <SideBar />

                    <div className="lg:col-span-9 space-y-8">
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Learning</h1>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard label="Total Courses" value="6" icon={GraduationCap} color="blue" />
                            <StatCard label="Completed" value="4" icon={Award} color="green" />
                            <StatCard label="In Progress" value="6" icon={Loader2} color="purple" />
                            <StatCard label="Total Hours" value="68" icon={Clock} color="orange" />
                        </div>

                        {/* Filters & Search */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2 bg-white dark:bg-[#1c1c1f] p-1 rounded-xl border border-slate-100 dark:border-[#2a2a2e] w-full md:w-auto overflow-x-auto">
                                {['My Courses', 'In Progress', 'Completed', 'Bookmarked'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => handleTabChange(tab)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                                            activeTab === tab
                                                ? 'bg-[#0061EF] text-white shadow-md'
                                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#2a2a2e]'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" size={18} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setPageNumber(1); // إعادة الصفحة لـ 1 عند البحث
                                    }}
                                    placeholder="Search Your Course"
                                    className="w-full bg-blue-50/50 dark:bg-[#1c1c1f] dark:text-white dark:placeholder:text-slate-500 border border-blue-100 dark:border-[#2a2a2e] rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* Courses Grid with Loading/Error States */}
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="animate-spin text-blue-600" size={40} />
                            </div>
                        ) : isError ? (
                            <div className="text-center py-12 text-red-500 font-medium">
                                something went wrong while fetching your courses. Please try again later.
                            </div>
                        ) : data?.items?.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 dark:text-slate-400 font-medium">
                                No courses found. Try adjusting your search or filter to find what you're looking for.
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {data?.items.map((course) => (
                                        // تأكد إن كومبوننت الـ CourseCard بيستقبل البروبس بنفس أسماء الـ API الجديد
                                        <CourseCard course={{
                                            id: course.keyId ?? '',
                                            image: course.imageUrl??'',
                                            category: course.tags || [],
                                            title: course.title??'',
                                            instructor: course.instructorName??'',
                                            rating: course.rating,
                                            duration: '10h',
                                            lectures: 10,
                                            price: course.price,
                                            enrolled: course.isEnrolled,
                                            bookMarked: course.isBookmarked
                                        }} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {data && data.totalPages > 1 && (
                                    <div className="flex justify-end items-center gap-2 mt-4">
                                        <button
                                            onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                                            disabled={!data.hasPreviousPage}
                                            className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${
                                                data.hasPreviousPage
                                                ? 'bg-[#0061EF] text-white hover:bg-blue-700'
                                                : 'bg-slate-200 dark:bg-[#2a2a2e] text-slate-400 cursor-not-allowed'
                                            }`}
                                        >
                                            <ChevronLeft size={18} />
                                        </button>

                                        <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-200 dark:bg-[#2a2a2e] text-slate-600 dark:text-slate-300 font-bold text-sm">
                                            {data.pageNumber}
                                        </span>

                                        <button
                                            onClick={() => setPageNumber(prev => prev + 1)}
                                            disabled={!data.hasNextPage}
                                            className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${
                                                data.hasNextPage
                                                ? 'bg-[#0061EF] text-white hover:bg-blue-700'
                                                : 'bg-slate-200 dark:bg-[#2a2a2e] text-slate-400 cursor-not-allowed'
                                            }`}
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProfilePage;