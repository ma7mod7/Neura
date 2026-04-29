import {
    Server, Shield, Users, Settings, ArrowLeft, MessageSquare
} from 'lucide-react';
// قم بتعديل مسار الـ Link حسب مكتبة التوجيه التي تستخدمها (react-router-dom)
import { Link, useLocation } from 'react-router-dom';

export default function CommunityAdminSidebar() {
    const location = useLocation();
    const currentPath = location.pathname;

    const navItems = [
        { name: 'Overview', icon: <Server size={20} />, path: '/admin/community' },
        { name: 'Manage Spaces', icon: <MessageSquare size={20} />, path: '/admin/community/spaces' },
        { name: 'Members', icon: <Users size={20} />, path: '/admin/community/members' },
        { name: 'Moderation', icon: <Shield size={20} />, path: '/admin/community/moderation' },
        { name: 'Settings', icon: <Settings size={20} />, path: '/admin/community/settings' },
    ];

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#1c1c1f] border-r border-slate-200 dark:border-[#2a2a2e] flex flex-col z-30 transition-colors shadow-sm">

            {/* Header */}
            <div className="h-20 flex items-center px-6 border-b border-slate-200 dark:border-[#2a2a2e]">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <Server size={24} />
                    </div>
                    <h1 className="font-extrabold text-slate-900 dark:text-white text-lg leading-tight">
                        Community<br />Admin
                    </h1>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                <p className="px-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                    Management
                </p>

                {navItems.map((item) => {
                    // لتحديد العنصر النشط (Active)
                    const isActive = currentPath === item.path || (currentPath === '/admin/community' && item.name === 'Overview');

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 ${isActive
                                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#2a2a2e] hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                        >
                            {item.icon}
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Back to Main Admin */}
            <div className="p-4 border-t border-slate-200 dark:border-[#2a2a2e]">
                <Link
                    to="/community/students"
                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#2a2a2e]"
                >
                    <ArrowLeft size={18} />
                    Back to Main Platform
                </Link>
            </div>
        </aside>
    );
}