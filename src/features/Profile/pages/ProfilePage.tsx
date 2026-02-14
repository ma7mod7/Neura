import  { useState } from 'react';
import {
    BookOpen,
    ListChecks,
    Settings,
    LogOut,
    Pencil,
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
import Course from '../../../assets/course.png';


// 1. Sidebar Menu Item
const MenuItem = ({ icon: Icon, label, isActive = false }: { icon: any, label: string, isActive?: boolean }) => (
    <button
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
            ? 'bg-blue-50 text-[#0061EF] border border-blue-100'
            : 'text-slate-600 hover:bg-slate-50'
            }`}
    >
        <Icon size={20} />
        {label}
    </button>
);


const StatCard = ({ label, value, icon: Icon, color }: any) => {
    // Color variants mapping
    const colors: any = {
        blue: { border: 'border-blue-200', text: 'text-blue-600', iconBg: 'text-blue-600',bgColor:"bg-blue-50" },
        green: { border: 'border-green-200', text: 'text-green-600', iconBg: 'text-green-600',bgColor:"bg-green-50" },
        purple: { border: 'border-purple-200', text: 'text-purple-600', iconBg: 'text-purple-600',bgColor:"bg-purple-50" },
        orange: { border: 'border-orange-200', text: 'text-orange-600', iconBg: 'text-orange-600',bgColor:"bg-orange-50" },
    };

    const theme = colors[color];

    return (
        <div className={`${theme.bgColor} p-5 rounded-2xl border ${theme.border} shadow-sm relative overflow-hidden h-36 flex flex-col justify-between`}>
            <h3 className={` font-semibold ${theme.text}`}>{label}</h3>
            <div className="flex items-end justify-between">
                <span className={`text-4xl font-bold ${theme.text}`}>{value}</span>
                <Icon size={36} className={`${theme.iconBg}`} strokeWidth={2.2} />
            </div>
        </div>
    );
};

const mockCourses = Array(6).fill({
    id: 'c1',
    image: 'https://placehold.co/600x400/1e293b/fff?text=AI+Course', // صورة داكنة شبه التصميم
    category: [{ id: 1, name: 'Artificial Intelligence' }, { id: 2, name: 'Intermediate' }],
    title: 'Artificial Intelligence A-Z: Learn AI with Python',
    instructor: 'Angela Yu',
    rating: 4.8,
    reviews: '280',
    duration: '45h',
    lectures: 138,
    price: 'Free' // أو أي سعر
});

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('My Courses');

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-inter">
            {/* 1. Navbar */}
            <NavBar />

            <main className=" mx-auto p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* --- LEFT SIDEBAR --- */}
                    <aside className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col h-full min-h-[600px]">

                            {/* User Profile Info */}
                            <div className="flex flex-col mb-8">
                                <div className='flex mb-2'>
                                    <div className="relative mb-3">
                                        <img
                                            src={Course}
                                            alt="Profile"
                                            className="w-20 h-20 mr-2 rounded-full border-2 border-[#0061EF] object-cover shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">mahmoudemad20016</h2>
                                        <p className="text-slate-500 text-sm mb-3">Ma7mod23</p>
                                        <span className="bg-[#FFB52B] text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                                            # 21558
                                        </span>
                                    </div>
                                </div>


                                <button className="w-full bg-[#E6F7ED] hover:bg-[#d1f0dd] text-[#00C267] font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
                                    <Pencil size={16} />
                                    Edit Profile
                                </button>
                            </div>

                            {/* Navigation Links */}
                            <nav className="space-y-2 flex-1">
                                <MenuItem icon={BookOpen} label="My Learning" isActive />
                                <MenuItem icon={ListChecks} label="Problem List" />
                                <MenuItem icon={Settings} label="Settings" />
                            </nav>

                            {/* Sign Out */}
                            <button className="mt-8 w-full bg-[#FEE2E2] hover:bg-[#fecaca] text-[#EF4444] font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
                                <LogOut size={18} />
                                Sign Out
                            </button>
                        </div>
                    </aside>

                    {/* --- RIGHT CONTENT --- */}
                    <div className="lg:col-span-9 space-y-8">

                        <h1 className="text-2xl font-bold text-slate-800">My Learning</h1>

                        {/* 1. Stats Cards Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                label="Total Courses"
                                value="6"
                                icon={GraduationCap}
                                color="blue"
                            />
                            <StatCard
                                label="Completed"
                                value="4"
                                icon={Award}
                                color="green"
                            />
                            <StatCard
                                label="In Progress"
                                value="6"
                                icon={Loader2}
                                color="purple"
                            />
                            <StatCard
                                label="Total Hours"
                                value="68"
                                icon={Clock}
                                color="orange"
                            />
                        </div>

                        {/* 2. Filters & Search */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            {/* Tabs */}
                            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-100 w-full md:w-auto overflow-x-auto">
                                {['My Courses', 'In Progress', 'Completed', 'Bookmarked'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab
                                            ? 'bg-[#0061EF] text-white shadow-md'
                                            : 'text-slate-500 hover:bg-slate-50'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Search */}
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" size={18} />
                                <input
                                    type="text"
                                    placeholder="search Your Course"
                                    className="w-full bg-blue-50/50 border border-blue-100 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* 3. Courses Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {mockCourses.map((course, index) => (
                                <CourseCard key={index} course={course} />
                            ))}
                        </div>

                        {/* 4. Pagination */}
                        <div className="flex justify-end items-center gap-2 mt-4">
                            <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#0061EF] text-white hover:bg-blue-700 transition-colors">
                                <ChevronLeft size={18} />
                            </button>
                            <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-300 text-slate-600 font-bold text-sm">
                                1
                            </span>
                            <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#0061EF] text-white hover:bg-blue-700 transition-colors">
                                <ChevronRight size={18} />
                            </button>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

// --- Helper Components (Internal) ---



export default ProfilePage;