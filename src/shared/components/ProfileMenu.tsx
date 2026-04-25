import {
    BookOpen,
    ListChecks,
    Settings,
    LogOut,
    LayoutDashboard,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useEffect, useRef } from 'react';

interface ProfileMenuProps {
    setIsOpen: (value: boolean) => void;
}
const ProfileMenu = ({ setIsOpen }: ProfileMenuProps) => {
    const { logout } = useAuth()
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth()



    const menuItems = [
        {
            label: 'My Learning',
            icon: BookOpen,
            path: '/profile',
            isActive: false
        },
        {
            label: 'Problem List',
            icon: ListChecks,
            path: '/profile',
            isActive: false
        },
        {
            label: 'Admin Dashboard',
            icon: LayoutDashboard,
            path: '/admin/course-list',
            isActive: false
        },
        {
            label: 'Settings',
            icon: Settings,
            path: '/profile',
            isActive: false
        },
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

            {/* --- Header Section (User Info) --- */}
            <div onClick={() => navigate('/profile')} className="p-4 border-b border-slate-100 dark:border-[#2a2a2e] flex items-center gap-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-[#2a2a2e] transition-colors">
                <img
                    src="https://avatar.iran.liara.run/public/30"
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
                            `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 text-slate-600 dark:text-slate-300 hover:bg-blue-100 hover:text-slate-900 dark:hover:text-white `}
                    >
                        <item.icon size={18} strokeWidth={item.isActive ? 2.5 : 2} />
                        {item.label}
                    </button>
                ))}

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