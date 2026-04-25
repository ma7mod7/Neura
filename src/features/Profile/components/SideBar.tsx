import {
    BookOpen,
    ListChecks,
    Settings,
    LogOut,
    Pencil,
    LayoutDashboard,
} from 'lucide-react';

import Course from '../../../assets/course.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

// 1. Sidebar Menu Item
const MenuItem = ({ icon: Icon, label, isActive = false, link }: { icon: any, label: string, isActive?: boolean, link?: string }) => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => link && navigate(link)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                    ? 'bg-blue-50 dark:bg-[#0061EF]/10 text-[#0061EF] border border-blue-100 dark:border-[#0061EF]/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#2a2a2e]'
            }`}
        >
            <Icon size={20} />
            {label}
        </button>
    );
};

const SideBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth()

    // دالة مساعدة عشان تفحص إذا كان المسار الحالي هو نفس مسار الزرار
    const checkIsActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <aside className="lg:col-span-3">
            <div className="bg-white dark:bg-[#1c1c1f] rounded-xl shadow-sm border border-slate-100 dark:border-[#2a2a2e] p-6 flex flex-col h-full min-h-[600px]">

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
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user?.firstName} {user?.lastName}</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">{user?.userName}</p>
                            <span className="bg-[#FFB52B] text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                                # 21558
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/profile/edit')}
                        className="w-full bg-[#E6F7ED] dark:bg-[#00C267]/10 hover:bg-[#d1f0dd] dark:hover:bg-[#00C267]/20 text-[#00C267] font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
                    >
                        <Pencil size={16} />
                        Edit Profile
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-2 flex-1">
                    {/* استخدمنا checkIsActive ومررنا الـ link لكل واحدة عشان ترجع true أو false */}
                    <MenuItem icon={BookOpen} label="My Learning" link='/profile' isActive={checkIsActive('/profile')} />
                    <MenuItem icon={ListChecks} label="Problem List" link='/problems' isActive={checkIsActive('/problems')} />
                    <MenuItem icon={Settings} label="Settings" link='/settings' isActive={checkIsActive('/settings')} />
                    <MenuItem icon={LayoutDashboard} label="Admin Dashboard" link='/admin/course-list' isActive={checkIsActive('/admin/course-list')} />
                </nav>

                {/* Sign Out */}
                <button className="mt-8 w-full bg-[#FEE2E2] dark:bg-red-500/10 hover:bg-[#fecaca] dark:hover:bg-red-500/20 text-[#EF4444] font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}

export default SideBar;