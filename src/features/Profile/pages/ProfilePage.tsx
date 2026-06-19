import { useState } from 'react';
import {
    GraduationCap,
    Award,
    Loader2,
    Clock,
    Search,
    Bookmark,
} from 'lucide-react';
import NavBar from '../../../shared/components/NavBar';
import CourseCard from '../../../shared/components/CourseCard';
import Footer from '../../../shared/components/footerauth';
import SideBar from '../components/SideBar';
import Pagination from '../../dashboard/components/Pagination';
import { useTranslation } from 'react-i18next';
import { useProfileCourses } from '../hooks/useProfileCourses';
import { useEnrollmentDashboard } from '../hooks/useEnrollmentDashboard';
import CourseCardWithProgress from '../../courses/components/CourseCardWithProgress';

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) => {
    const colors: Record<string, { border: string, text: string, iconBg: string, bgColor: string }> = {
        blue:   { border: 'border-blue-200 dark:border-blue-900',   text: 'text-blue-600',   iconBg: 'text-blue-600',   bgColor: 'bg-blue-50 dark:bg-blue-900/20'   },
        green:  { border: 'border-green-200 dark:border-green-900',  text: 'text-green-600',  iconBg: 'text-green-600',  bgColor: 'bg-green-50 dark:bg-green-900/20'  },
        purple: { border: 'border-purple-200 dark:border-purple-900',text: 'text-purple-600', iconBg: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
        orange: { border: 'border-orange-200 dark:border-orange-900',text: 'text-orange-600', iconBg: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
        yellow: { border: 'border-yellow-200 dark:border-yellow-900',text: 'text-yellow-600', iconBg: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
    };

    const theme = colors[color];

    return (
        <div className={`${theme.bgColor} p-5 rounded-2xl border ${theme.border} shadow-sm relative overflow-hidden h-36 flex flex-col justify-between`}>
            <h3 className={`font-semibold ${theme.text}`}>{label}</h3>
            <div className="flex items-end justify-between">
                <span className={`text-4xl font-bold ${theme.text}`}>{value}</span>
                <Icon size={36} className={theme.iconBg} strokeWidth={2.2} />
            </div>
        </div>
    );
};

const ProfilePage = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('My Courses');
    const [pageNumber, setPageNumber] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // Main query for the active tab
    const { data, isLoading, isError } = useProfileCourses(activeTab, pageNumber, searchTerm);

    // Stat queries single dashboard call + bookmarked count
    const { data: dashboard } = useEnrollmentDashboard();
    const { data: bookmarkedData } = useProfileCourses('Bookmarked', 1, '');

    const totalBookmarked = bookmarkedData?.items?.length ?? 0;

    // Log dashboard once to find field names — remove after confirming
    // console.log('dashboard:', dashboard);
    console.log('My Courses data:', data?.items?.map((c: any) => ({ 
    title: c.title, 
    isEnrolled: c.isEnrolled,
    progressPercentage: c.progressPercentage,
    roleName: c.roleName
})));

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setPageNumber(1);
    };

    const tabs = [
        { key: 'My Courses',  label: t('profile.myCourses')  },
        { key: 'In Progress', label: t('profile.inProgress')  },
        { key: 'Completed',   label: t('profile.completed')   },
        { key: 'Bookmarked',  label: t('profile.bookmarked')  },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0e0e10] font-inter">
            <NavBar />

            <main className="mx-auto p-2 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    <SideBar />

                    <div className="lg:col-span-9 space-y-8">
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                            {t('profile.myLearning')}
                        </h1>

                        {/* Stat Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <StatCard
                                label={t('profile.totalCourses')}
                                value={String(dashboard?.totalCourses ?? 0)}
                                icon={GraduationCap}
                                color="blue"
                            />
                            <StatCard
                                label={t('profile.completed')}
                                value={String(dashboard?.completedCourses ?? 0)}
                                icon={Award}
                                color="green"
                            />
                            <StatCard
                                label={t('profile.inProgress')}
                                value={String(dashboard?.inProgressCourses ?? 0)}
                                icon={Loader2}
                                color="purple"
                            />
                            <StatCard
                                label={t('profile.totalHours')}
                                value={Number(dashboard?.totalHours ?? 0).toFixed(1)}
                                icon={Clock}
                                color="orange"
                            />
                            <StatCard
                                label={t('profile.bookmarked')}
                                value={String(totalBookmarked)}
                                icon={Bookmark}
                                color="yellow"
                            />
                        </div>

                        {/* Filters & Search */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2 bg-white dark:bg-[#1c1c1f] p-1 rounded-xl border border-slate-100 dark:border-[#2a2a2e] w-full md:w-auto overflow-x-auto">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => handleTabChange(tab.key)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                                            activeTab === tab.key
                                                ? 'bg-[#0061EF] text-white shadow-md'
                                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#2a2a2e]'
                                        }`}
                                    >
                                        {tab.label}
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
                                        setPageNumber(1);
                                    }}
                                    placeholder={t('profile.searchPlaceholder')}
                                    className="w-full bg-blue-50/50 dark:bg-[#1c1c1f] dark:text-white dark:placeholder:text-slate-500 border border-blue-100 dark:border-[#2a2a2e] rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* Courses Grid */}
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="animate-spin text-blue-600" size={40} />
                            </div>
                        ) : isError ? (
                            <div className="text-center py-12 text-red-500 font-medium">
                                {t('profile.errorFetching')}
                            </div>
                        ) : data?.items?.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 dark:text-slate-400 font-medium">
                                {t('profile.noCoursesFound')}
                            </div>
                        ) : (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                                {data?.items.map((course: any) => {
                                    console.log(course.title, 'isEnrolled:', course.isEnrolled);
                                    console.log(course.title, 'progress:', course.progressPercentage);
                                    return (
                                        <CourseCardWithProgress
                                            key={course.keyId}
                                            course={course}
                                            showGoToCourse={activeTab !== 'Bookmarked'}
                                        />
                                    );
                                })}
                                
                            </div>
                                {data && data.totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-4 mt-8">
                                        <Pagination
                                            currentPage={data.pageNumber || 1}
                                            totalPages={data.totalPages || 1}
                                            hasNextPage={data.hasNextPage || false}
                                            hasPreviousPage={data.hasPreviousPage || false}
                                            onPageChange={(newPage) => {
                                                setPageNumber(newPage);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                        />
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