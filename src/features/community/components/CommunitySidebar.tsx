// src/pages/Community/components/CommunitySidebar.tsx
import {
    Hash, Volume2, Bell, Plus, Settings, ChevronDown,
    Home
} from 'lucide-react';
import type { CommunitySpace } from '../types/communityTypes';
import { Link } from 'react-router-dom';

interface CommunitySidebarProps {
    spaces: CommunitySpace[];
    activeSpaceId: string;
    setActiveSpaceId: (id: string) => void;
    activeChannelId: string;
    setActiveChannelId: (id: string) => void;
}

export default function CommunitySidebar({
    spaces,
    activeSpaceId,
    setActiveSpaceId,
    activeChannelId,
    setActiveChannelId
}: CommunitySidebarProps) {

    const activeSpace = spaces.find(s => s.id === activeSpaceId);

    return (
        <div className="flex h-full flex-shrink-0 z-20 shadow-lg">

            {/* 1. FAR LEFT: Spaces (Servers) Column */}
            <div className="w-[72px] flex-shrink-0 bg-slate-100 dark:bg-[#161619] border-r border-slate-200 dark:border-[#2a2a2e] flex flex-col items-center py-4 gap-3">
                {spaces.map(space => (
                    <div
                        key={space.id}
                        className="relative group cursor-pointer"
                        onClick={() => {
                            setActiveSpaceId(space.id);
                            if (space.channels.length > 0) {
                                setActiveChannelId(space.channels[0].id); // Auto-select first channel
                            }
                        }}
                    >
                        {/* Active Indicator Line */}
                        <div className={`absolute -left-3 top-1/2 -translate-y-1/2 w-2 bg-blue-600 rounded-r-full transition-all duration-300 ${activeSpaceId === space.id ? 'h-10' : 'h-0 group-hover:h-5'}`} />

                        <img
                            src={space.imageUrl}
                            alt={space.name}
                            className={`w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-300 object-cover ${activeSpaceId === space.id ? 'rounded-[16px] ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-[#161619]' : ''}`}
                        />
                    </div>
                ))}

                <div className="w-8 h-[2px] bg-slate-200 dark:bg-[#2a2a2e] rounded-full my-2" />

                {/* Add Space Button */}
                <button
                    title="Create New Space"
                    className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-white dark:bg-[#2a2a2e] text-green-600 flex items-center justify-center transition-all duration-300 shadow-sm border border-slate-200 dark:border-transparent hover:bg-green-500 hover:text-white dark:hover:bg-green-500"
                >
                    <Plus size={24} />
                </button>
                <div className="p-4 border-t border-slate-200 dark:border-[#2a2a2e]">
                    <Link
                        to="/announcements"
                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#2a2a2e]"
                    >
                        <Home size={22} />
                    
                    </Link>
                </div>
            </div>

            {/* 2. INNER LEFT: Channels Column */}
            <div className="w-64 flex-shrink-0 bg-slate-50 dark:bg-[#1c1c1f] border-r border-slate-200 dark:border-[#2a2a2e] flex flex-col">

                {/* Space Header */}
                <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-[#2a2a2e] shadow-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-[#2a2a2e] transition-colors">
                    <h2 className="font-bold text-slate-900 dark:text-white truncate">{activeSpace?.name || "Community"}</h2>
                    <ChevronDown size={18} className="text-slate-500 dark:text-slate-400" />
                </div>

                {/* Channels List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                    {/* Category Label */}
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 mt-2 px-2 flex items-center justify-between group">
                        Text Channels
                        <Plus size={14} className="opacity-0 group-hover:opacity-100 cursor-pointer hover:text-slate-700 dark:hover:text-white transition-opacity" />
                    </p>

                    {activeSpace?.channels.map(channel => (
                        <div
                            key={channel.id}
                            onClick={() => setActiveChannelId(channel.id)}
                            className={`flex items-center justify-between px-2 py-2 rounded-md cursor-pointer transition-colors group ${activeChannelId === channel.id ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2a2a2e] hover:text-slate-900 dark:hover:text-slate-200'}`}
                        >
                            <div className="flex items-center gap-2 truncate">
                                {channel.type === 'text' && <Hash size={18} className="opacity-70" />}
                                {channel.type === 'voice' && <Volume2 size={18} className="opacity-70" />}
                                {channel.type === 'announcement' && <Bell size={18} className="opacity-70" />}
                                <span className="font-medium text-sm truncate">{channel.name}</span>
                            </div>

                            {/* Unread Badge */}
                            {channel.unreadCount && channel.unreadCount > 0 && activeChannelId !== channel.id && (
                                <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {channel.unreadCount}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Current User Mini Profile (Fixed at bottom) */}
                <div className="h-16 bg-slate-100 dark:bg-[#161619] p-2 flex items-center justify-between border-t border-slate-200 dark:border-[#2a2a2e] shrink-0">
                    <div className="flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-[#2a2a2e] p-1.5 rounded-md cursor-pointer transition-colors flex-1 overflow-hidden">
                        <div className="relative">
                            <img src="https://ui-avatars.com/api/?name=User" className="w-8 h-8 rounded-full" alt="me" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-slate-100 dark:border-[#161619] rounded-full" />
                        </div>
                        <div className="flex flex-col truncate">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">Mahmoud Emad</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">Online</span>
                        </div>
                    </div>
                    <button className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-200 dark:hover:bg-[#2a2a2e] transition-colors">
                        <Settings size={18} />
                    </button>
                </div>

            </div>
        </div>
    );
}