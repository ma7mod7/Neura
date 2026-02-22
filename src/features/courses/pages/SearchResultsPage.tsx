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
import Footer from '../../../shared/components/Footer';

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


const SearchResultsPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // بناخد كلمة البحث من الرابط (URL)
    // لو مفيش كلمة بحث، بنفترض إنها "blockchain" زي الصورة
    const query = searchParams.get('query') || 'blockchain';
    const [searchQuery, setSearchQuery] = useState(query);

    // --- Mock Data (بيانات وهمية شبه اللي في الصورة) ---
    const searchResults: Course[] = [
        {
            id: 'c1',
            image: 'https://placehold.co/600x400/2563eb/fff?text=Python+Bootcamp',
            category: [{
                id: 1,
                name: "ai"
            }],
            title: 'Complete Machine Learning & Data Science Bootcamp',
            instructor: 'Angela Yu',
            rating: 4.8,
            duration: '45h',
            lectures: 138,
            price:  350,
            enrolled: true,
            bookMarked: false,
        },
        {
            id: '2',
            image: 'https://placehold.co/600x400/000/fff?text=Python',
            category: [{
                id: 1,
                name: "ai"
            }], title: 'Complete Machine Learning & Data Science Bootcamp',
            instructor: 'Dr. Angela Yu',
            rating: 4.8,
            duration: '45h',
            lectures: 136,
            price:  350,
            enrolled: true,
            bookMarked: false,
        },
        {
            id: '3',
            image: 'https://placehold.co/600x400/000/fff?text=Python',
            category: [{
                id: 1,
                name: "ai"
            }], title: 'Complete Machine Learning & Data Science Bootcamp',
            instructor: 'Dr. Angela Yu',
            rating: 4.8,
            duration: '45h',
            lectures: 138,
            price: 0,
            enrolled: true,
            bookMarked: false,
        },
        {
            id: '4',
            image: 'https://placehold.co/600x400/000/fff?text=Python',
            category: [{
                id: 1,
                name: "ai"
            }], title: 'Complete Machine Learning & Data Science Bootcamp',
            instructor: 'Dr. Angela Yu',
            rating: 4.8,
            duration: '45h',
            lectures: 138,
            price:  350,
            enrolled: true,
            bookMarked: false,
        },
        {
            id: '5',
            image: 'https://placehold.co/600x400/000/fff?text=Python',
            category: [{
                id: 1,
                name: "ai"
            }], title: 'Complete Machine Learning & Data Science Bootcamp',
            instructor: 'Dr. Angela Yu',
            rating: 4.8,
            duration: '45h',
            lectures: 136,
            price:  350,
            enrolled: true,
            bookMarked: false,
        },

    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-inter">

            {/* --- 1. Top Navigation (نفس اللي في صفحتك الرئيسية) --- */}
            <nav className="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 py-3 shadow-md">
                <div className="max-w-[1450px] mx-auto flex items-center justify-between gap-4 md:gap-8">
                    {/* Logo */}
                    <div className="flex items-center gap-2 shrink-0 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="h-8 w-8 rounded-lg bg-[#0061EF] flex items-center justify-center">
                            <span className="text-white font-bold text-xl">N</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-[#0061EF] hidden sm:block">NEURA</span>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-2xl relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            // لما يضغط Enter يبحث تاني
                            onKeyDown={(e) => e.key === 'Enter' && navigate(`/search-results?query=${searchQuery}`)}
                            className="w-full bg-white rounded-xl py-2.5 pl-12 pr-4 outline-none border border-[#0061EF] text-slate-700 text-sm shadow-sm"
                        />
                    </div>

                    {/* Icons & Profile */}
                    <div className="flex items-center gap-3 md:gap-5">
                        <button onClick={() => navigate('/announcements')} className="p-2 text-slate-600 hover:text-[#0061EF] transition-colors">
                            <Home size={22} />
                        </button>
                        <button className="p-2 text-slate-600 hover:text-[#0061EF] transition-colors relative">
                            <Bell size={22} />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <img src="https://avatar.iran.liara.run/public/30" className="w-10 h-10 rounded-full border-2 border-[#0061EF] cursor-pointer object-cover p-0.5" alt="Profile" />
                    </div>
                </div>
            </nav>

            <main className="max-w-[1450px] mx-auto p-4 md:p-8">

                {/* --- 2. Search Result Header & Filters --- */}
                <div className="mb-8">
                    {/* Title */}
                    <h1 className="text-2xl text-slate-600 mb-6">
                        Result of <span className="font-bold text-black">“{query}”</span>
                    </h1>

                    {/* Filter Tags Row */}
                    <div className="flex flex-wrap items-center justify-end gap-3">
                        {/* Active Filter 1: Free */}
                        <button className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0061EF] text-[#0061EF] bg-white hover:bg-blue-50 transition-colors text-sm font-medium">
                            Free
                            <XCircle size={16} />
                        </button>

                        {/* Active Filter 2: Beginner */}
                        <button className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0061EF] text-[#0061EF] bg-white hover:bg-blue-50 transition-colors text-sm font-medium">
                            Beginner
                            <XCircle size={16} />
                        </button>

                        {/* Filter Trigger Button */}
                        <button className="flex items-center gap-2 px-6 py-1.5 rounded-full border border-[#0061EF] text-[#0061EF] bg-white hover:bg-blue-50 transition-colors text-sm font-medium ml-2">
                            <Filter size={16} />
                            Filter
                        </button>
                    </div>
                </div>

                {/* --- 3. Results Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-20">
                    {searchResults.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>

            </main>

            {/* --- 4. Footer --- */}
            <Footer />
        </div>
    );
};

export default SearchResultsPage;