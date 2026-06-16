import { useState } from 'react';
import { BookOpen, Plus, List, ChevronDown, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../../../assets/logo.png'
import { useAuth } from "../../auth/hooks/useAuth";
import { ClipboardList } from 'lucide-react';
import { hasAdminRole } from '../../../utils/jwt';

export default function Sidebar() {
    const [isCoursesOpen, setIsCoursesOpen] = useState(true);
    const { token } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const isAdmin = hasAdminRole(token);

    // استدعاء useLocation لمعرفة مسار الصفحة الحالي
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <aside className="w-64 bg-white dark:bg-[#1c1c1f] flex flex-col fixed h-full shadow-md z-10 start-0">
            {/* ================= Header ================= */}
            <div className="p-6 flex items-center gap-2">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    <img src={Logo} alt="" className="h-12 rounded-full w-auto object-contain" />

                </div>
                <span className="text-xl font-bold text-blue-600">Neura</span>
            </div>

            {/* ================= Middle Nav ================= */}
            <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">

                {/* Courses Menu */}
                <div className="bg-blue-600 text-white rounded-lg overflow-hidden transition-all duration-300">
                    {/* Courses Dropdown Header */}
                    <div
                        className="flex items-center justify-between p-3 cursor-pointer select-none hover:bg-blue-700 transition-colors"
                        onClick={() => setIsCoursesOpen(!isCoursesOpen)}
                    >
                        <div className="flex items-center gap-3 font-medium">
                            <BookOpen size={20} />
                            <span>{t('admin.courses', 'Courses')}</span>
                        </div>
                        <ChevronDown
                            size={18}
                            className={`transition-transform duration-300 ${isCoursesOpen ? "rotate-180" : "rotate-0"}`}
                        />
                    </div>

                    {/* Courses Dropdown Items */}
                    <div
                        className={`flex flex-col transition-all duration-300 ease-in-out ${isCoursesOpen ? "max-h-40 opacity-100 pb-2" : "max-h-0 opacity-0 overflow-hidden"
                            }`}
                    >
                        {/* زر إنشاء كورس */}
                        <button
                            onClick={() => navigate('/admin/create-course')}
                            className={`flex items-center gap-3 py-2 transition-colors text-sm mt-1 ${currentPath === '/admin/create-course'
                                ? 'bg-white text-blue-600 rounded-md mx-4 px-6 font-medium' // Active Style
                                : 'ps-10 pe-6 text-blue-100 hover:bg-blue-700' // Inactive Style
                                }`}
                        >
                            <Plus size={16} />
                            {t('admin.createCourse', 'Create Course')}
                        </button>

                        {/* زر قائمة الكورسات */}
                        <button
                            onClick={() => navigate('/admin/course-list')}
                            className={`flex items-center gap-3 py-2 transition-colors text-sm mt-1 ${currentPath === '/admin/course-list'
                                ? 'bg-white text-blue-600 rounded-md mx-4 px-6 font-medium' // Active Style
                                : 'ps-10 pe-6 text-blue-100 hover:bg-blue-700' // Inactive Style
                                }`}
                        >
                            <List size={16} />
                            {t('admin.courseList', 'Course List')}
                        </button>
                    </div>
                    {isAdmin && (
                    <div
                        onClick={() => navigate('/dashboard/instructor-applications')}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors font-medium ${
                            currentPath.includes('/dashboard/instructor-applications')
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2e]'
                        }`}
                        >
                        <ClipboardList size={20} />
                        <span>Applications</span>
                        </div>
                        )}
                </div>

                {/* Students Menu */}
                {/* <div
                    onClick={() => navigate('/admin/students')}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors font-medium ${currentPath.includes('/admin/students')
                            ? 'bg-blue-600 text-white' // Active Style
                            : 'text-gray-700 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2e]' // Inactive Style
                        }`}
                >
                    <Users size={20} />
                    <span>Students</span>
                </div> */}
            </nav>

            {/* ================= Bottom Action ================= */}
            <div className="p-4 border-t border-gray-100 dark:border-[#2a2a2e]">
                <button
                    onClick={() => navigate('/courses')}
                    className="flex items-center gap-3 p-3 w-full text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#0061EF]/10 rounded-lg transition-colors font-medium"
                >
                    <ArrowLeft size={20} className="rtl:rotate-180" />
                    <span>{t('admin.backToCourses', 'Back to Courses')}</span>
                </button>
            </div>
        </aside>
    );
}