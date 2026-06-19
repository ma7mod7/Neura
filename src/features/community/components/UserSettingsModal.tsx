import { useState } from 'react';
import { X, User, Palette, Bell, Shield, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import ThemeToggle from '../../../shared/components/ThemeToggle';
import { useTranslation } from 'react-i18next';

interface UserSettingsModalProps {
    onClose: () => void;
    currentUserName: string;
    currentUserAvatar?: string;
}



export default function UserSettingsModal({ onClose, currentUserName, currentUserAvatar }: UserSettingsModalProps) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('account');
    const { user, logout } = useAuth();   
    const navigate = useNavigate();
    const location = useLocation();
    console.log('user object:', user);
    const handleLogout = () => {
    logout();
    navigate(location.state?.from ?? '/', { replace: true });
};
    const TABS = [
        { id: 'account', label: t('community.myAccount'), icon: User },
        { id: 'appearance', label: t('community.appearance'), icon: Palette },
        { id: 'notifications', label:  t('community.notifications'), icon: Bell },
        { id: 'privacy', label: t('community.privacy'), icon: Shield },
    ];

    return (
        <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm" onClick={onClose}>
           <div className="flex flex-col md:flex-row w-full h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Tabs sidebar */}
                <div className="w-full md:w-60 bg-slate-100 dark:bg-[#1c1c1f] flex flex-row md:flex-col overflow-x-auto md:overflow-visible py-3 md:py-12 px-3 md:ml-auto">
                    <p className="text-xs font-bold uppercase text-slate-400 px-3 mb-2">{t('community.userSettings')}</p>
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium mb-1 transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2a2a2e]'
                                }`}
                            >
                                <Icon size={16} /> {tab.label}
                            </button>
                        );
                    })}
                    <div className="mt-auto border-t border-slate-200 dark:border-[#2a2a2e] pt-3">
                       <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 w-full">
                            <LogOut size={16} />{t('community.logout')}
                        </button>
                    </div>
                </div>

                {/* Content panel */}
                <div className="flex-1 max-w-2xl bg-white dark:bg-[#2a2a2e] py-6 px-5 md:py-12 md:px-10 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 md:top-12 md:right-10 text-slate-400 hover:text-slate-700 dark:hover:text-white border border-slate-300 dark:border-slate-600 rounded-full p-1.5"
                    >
                        <X size={18} />
                    </button>

                    {activeTab === 'account' && (
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('community.myAccount')}</h2>
                                <div className="bg-slate-50 dark:bg-[#1c1c1f] rounded-lg overflow-hidden">
                                    <div className="h-20 bg-blue-600" />
                                    <div className="px-4 pb-4">
                                        <img
                                            src={currentUserAvatar}
                                            alt="avatar"
                                            className="w-20 h-20 rounded-full border-4 border-white dark:border-[#1c1c1f] -mt-10"
                                        />
                                        <p className="font-bold text-lg text-slate-900 dark:text-white mt-2">{currentUserName}</p>

                                        <div className="mt-4 space-y-3">
                                            <div className="flex justify-between items-center bg-white dark:bg-[#2a2a2e] rounded-md px-4 py-3">
                                                <div>
                                                    <p className="text-xs text-slate-400 uppercase font-bold">{t('community.username')}</p>
                                                    <p className="text-sm text-slate-900 dark:text-white">{user?.userName}</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center bg-white dark:bg-[#2a2a2e] rounded-md px-4 py-3">
                                                <div>
                                                    <p className="text-xs text-slate-400 uppercase font-bold">{t('community.email')}</p>
                                                    <p className="text-sm text-slate-900 dark:text-white">{user?.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center bg-white dark:bg-[#2a2a2e] rounded-md px-4 py-3">
                                                <div>
                                                    <p className="text-xs text-slate-400 uppercase font-bold">{t('community.discordHandle')}</p>
                                                    <p className="text-sm text-slate-900 dark:text-white">
                                                        {user?.discordHandle || <span className="text-slate-400 italic">{t('community.discordNotSet')}</span>}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('community.appearance')}</h2>
                            <div className="flex items-center justify-between bg-slate-50 dark:bg-[#1c1c1f] rounded-md px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{t('community.theme')}</p>
                                    <p className="text-xs text-slate-400">{t('community.themeDesc')}</p>
                                </div>
                                <ThemeToggle />
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('community.notifications')}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('community.notificationsComingSoon')}</p>
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('community.privacy')}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('community.privacyComingSoon')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}