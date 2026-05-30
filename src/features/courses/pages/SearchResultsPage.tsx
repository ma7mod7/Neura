import { useState } from 'react';
import {
    Search,
    Home,
    Bell,
    Filter,
    XCircle
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CourseCard from '../../../shared/components/CourseCard';
import Footer from '../../../shared/components/footerauth';
import { useTranslation } from 'react-i18next';

export interface Tag {
    id: number;
    name: string;
}

const SearchResultsPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();

    const query = searchParams.get('query') || 'blockchain';
    const [searchQuery, setSearchQuery] = useState(query);

    const searchResults = [
        {
            keyId: 'c1',
            imageUrl: 'https://placehold.co/600x400/2563eb/fff?text=Python+Bootcamp',
            category: [{ id: 1, name: "ai" }],
            title: 'Complete Machine Learning & Data Science Bootcamp',
            instructorName: 'Angela Yu',
            rating: 4.8,
            tags: [{ id: 1, name: "ai" }],
            totalReviews: 1200,
            hours: 45,
            numberOfLessons: 138,
            price: 350,
            isEnrolled: true,
            isBookmarked: false,
            isEnrollmentOpen: true,
            progressPercentage: 45
        },
        {
            keyId: 'c2',
            imageUrl: 'https://placehold.co/600x400/2563eb/fff?text=Python+Bootcamp',
            category: [{ id: 1, name: "ai" }],
            title: 'Complete Machine Learning & Data Science Bootcamp',
            instructorName: 'Angela Yu',
            rating: 4.8,
            tags: [{ id: 1, name: "ai" }],
            totalReviews: 1200,
            hours: 45,
            numberOfLessons: 138,
            price: 350,
            isEnrolled: true,
            isBookmarked: false,
            isEnrollmentOpen: true,
            progressPercentage: 100
        }
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0e0e10] font-inter">

            <nav className="sticky top-0 z-50 bg-white dark:bg-[#0e0e10]/70 dark:backdrop-blur-md border-b border-slate-100 dark:border-[#1c1c1f] px-4 py-3 shadow-md">
                <div className="max-w-[1450px] mx-auto flex items-center justify-between gap-4 md:gap-8">

                    <div className="flex items-center gap-2 shrink-0 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="h-8 w-8 rounded-lg bg-[#0061EF] flex items-center justify-center">
                            <span className="text-white font-bold text-xl">N</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-[#0061EF] hidden sm:block">NEURA</span>
                    </div>

                    <div className="flex-1 max-w-2xl relative">
                        <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && navigate(`/search-results?query=${searchQuery}`)}
                            placeholder={t('navigation.searchPlaceholder')}
                            className="w-full bg-white dark:bg-[#1c1c1f] dark:text-white dark:placeholder:text-slate-500 rounded-xl py-2.5 ps-12 pe-4 outline-none border border-[#0061EF] dark:border-[#0061EF]/40 text-slate-700 text-sm shadow-sm focus:ring-2 focus:ring-[#0061EF] transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3 md:gap-5">
                        <button onClick={() => navigate('/announcements')} className="p-2 text-slate-600 dark:text-slate-400 hover:text-[#0061EF] dark:hover:text-[#0061EF] transition-colors">
                            <Home size={22} />
                        </button>
                        <button className="p-2 text-slate-600 dark:text-slate-400 hover:text-[#0061EF] dark:hover:text-[#0061EF] transition-colors relative">
                            <Bell size={22} />
                            <span className="absolute top-2 end-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0e0e10]"></span>
                        </button>
                        <img src="https://avatar.iran.liara.run/public/30" onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full border-2 border-[#0061EF] cursor-pointer object-cover p-0.5" alt="Profile" />
                    </div>
                </div>
            </nav>

            <main className="max-w-[1450px] mx-auto p-4 md:p-8">

                <div className="mb-8">

                    <h1 className="text-2xl text-slate-600 dark:text-slate-400 mb-6">
                        {t('courses.searchResultTitle', { query })}
                    </h1>

                    <div className="flex flex-wrap items-center justify-end gap-3">

                        <button className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0061EF] text-[#0061EF] bg-white dark:bg-[#1c1c1f] hover:bg-blue-50 dark:hover:bg-[#0061EF]/10 transition-colors text-sm font-medium">
                            {t('common.free')}
                            <XCircle size={16} />
                        </button>

                        <button className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0061EF] text-[#0061EF] bg-white dark:bg-[#1c1c1f] hover:bg-blue-50 dark:hover:bg-[#0061EF]/10 transition-colors text-sm font-medium">
                            {t('courses.beginner')}
                            <XCircle size={16} />
                        </button>

                        <button className="flex items-center gap-2 px-6 py-1.5 rounded-full border border-[#0061EF] text-[#0061EF] bg-white dark:bg-[#1c1c1f] hover:bg-blue-50 dark:hover:bg-[#0061EF]/10 transition-colors text-sm font-medium ms-2">
                            <Filter size={16} />
                            {t('courses.filter')}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-20">
                    {searchResults.map((course) => (
                        <CourseCard key={course.keyId} course={course} />
                    ))}
                </div>

            </main>

            <Footer />
        </div>
    );
};

export default SearchResultsPage;
