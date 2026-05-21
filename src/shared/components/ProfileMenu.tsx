import {
    BookOpen,
    LogOut,
    LayoutDashboard,
    Moon,
    Sun,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useEffect, useRef } from 'react';
import { hasAdminRole } from '../../utils/jwt';

interface ProfileMenuProps {
    setIsOpen: (value: boolean) => void;
}
const ProfileMenu = ({ setIsOpen }: ProfileMenuProps) => {
    const { logout, token } = useAuth()
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth()
    const { isDark, toggleTheme } = useTheme();



    const canSeeAdminDashboard = hasAdminRole(token);

    const menuItems = [
        {
            label: 'My Learning',
            icon: BookOpen,
            path: '/profile',
            isActive: false
        },
        ...(canSeeAdminDashboard ? [{
            label: 'Admin Dashboard',
            icon: LayoutDashboard,
            path: '/admin/course-list',
            isActive: false
        }] : []),

    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div ref={menuRef} className="absolute top-full right-0 mt-4 w-64 bg-white dark:bg-[#1c1c1f] rounded-2xl shadow-xl border border-slate-100 dark:border-[#2a2a2e] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">

            <div onClick={() => navigate('/profile')} className="p-4 border-b border-slate-100 dark:border-[#2a2a2e] flex items-center gap-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-[#2a2a2e] transition-colors">
                <img
                    src={user?.imageUrl}
                    alt="User"
                    className="w-10 h-10 rounded-full border border-slate-200 dark:border-[#3a3a3e] object-cover"
                />
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{user?.firstName} {user?.lastName}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{user?.userName}</span>
                </div>
            </div>

            {/* --- Menu Items --- */}
            <div className="p-2">
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => navigate(item.path)}
                        className={
                            `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 text-slate-600 dark:text-slate-400 hover:bg-blue-100 hover:text-slate-900 dark:hover:text-black `}
                    >
                        <item.icon size={18} strokeWidth={item.isActive ? 2.5 : 2} />
                        {item.label}
                    </button>
                ))}

                {/* Dark / Light Mode Toggle */}
                <div className="mx-1 my-1.5 border-t border-slate-100 dark:border-[#2a2a2e]" />
                <div className="flex items-center justify-between px-3 py-2">
                    <span className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                        {isDark ? <Moon size={18} /> : <Sun size={18} />}
                        Theme
                    </span>
                    <button
                        onClick={toggleTheme}
                        aria-label="Toggle dark mode"
                        className="relative flex items-center w-16 h-8 rounded-full bg-slate-200 dark:bg-[#2a2a2e] p-1 transition-colors duration-300 cursor-pointer"
                    >
                        <span
                            className={`absolute flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-[#0061EF] shadow-md transition-all duration-300 ${isDark ? 'translate-x-8' : 'translate-x-0'}`}
                        >
                            {isDark
                                ? <Moon size={14} className="text-white" />
                                : <Sun size={14} className="text-amber-500" />
                            }
                        </span>
                        <Sun size={12} className={`ml-0.5 transition-opacity duration-300 ${isDark ? 'opacity-40 text-slate-500' : 'opacity-0'}`} />
                        <Moon size={12} className={`ml-auto mr-0.5 transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-40 text-slate-400'}`} />
                    </button>
                </div>
                <div className="mx-1 my-1.5 border-t border-slate-100 dark:border-[#2a2a2e]" />

                {/* Sign Out (Separate Item) */}
                <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-all mt-1"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default ProfileMenu;
