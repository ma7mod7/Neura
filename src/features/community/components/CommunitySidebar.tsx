import {
    Hash, Volume2, Bell, Plus, Settings, ChevronDown, Home, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CommunitySpace, CommunityChannel } from '../types/communityTypes';

interface CommunitySidebarProps {
    spaces: CommunitySpace[];
    activeSpaceId: string;
    setActiveSpaceId: (id: string) => void;
    activeChannelId: string;
    setActiveChannelId: (id: string) => void;
    channels: CommunityChannel[];   
    channelsLoading?: boolean;
    onAddChannel?: () => void;
    currentUserName?: string;
    currentUserAvatar?: string;
    onOpenSettings?: () => void;
}

const channelIcon = (type: CommunityChannel['type']) => {
    if (type === 'voice') return <Volume2 size={17} className="opacity-70 flex-shrink-0" />;
    if (type === 'announcement') return <Bell size={17} className="opacity-70 flex-shrink-0" />;
    return <Hash size={17} className="opacity-70 flex-shrink-0" />;
};

export default function CommunitySidebar({
    spaces,
    activeSpaceId,
    setActiveSpaceId,
    activeChannelId,
    setActiveChannelId,
    channels,
    channelsLoading,
    onAddChannel,
    currentUserName = 'You',
    currentUserAvatar,
    onOpenSettings,
}: CommunitySidebarProps) {

    const activeSpace = spaces.find(s => s.id === activeSpaceId);
    const textChannels = channels.filter(c => c.type === 'text');
    const voiceChannels = channels.filter(c => c.type === 'voice');

    return (
        <div className="flex h-full flex-shrink-0 z-20 shadow-lg">

            {/* Spaces column  */}
            <div className="w-[72px] flex-shrink-0 bg-slate-100 dark:bg-[#161619] border-r border-slate-200 dark:border-[#2a2a2e] flex flex-col items-center py-4 gap-3 overflow-y-auto custom-scrollbar">
                {spaces.map(space => (
                    <div
                        key={space.id}
                        className="relative group cursor-pointer"
                        onClick={() => {
                            setActiveSpaceId(space.id);
                        }}
                    >
                        <div className={`absolute -left-3 top-1/2 -translate-y-1/2 w-2 bg-blue-600 rounded-r-full transition-all duration-300 ${activeSpaceId === space.id ? 'h-10' : 'h-0 group-hover:h-5'}`} />
                        <img
                            src={space.imageUrl ?? `https://ui-avatars.com/api/?name=${space.name}&background=0D8ABC&color=fff`}
                            alt={space.name}
                            title={space.name}
                            className={`w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-300 object-cover ${activeSpaceId === space.id ? 'rounded-[16px] ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-[#161619]' : ''}`}
                        />
                    </div>
                ))}

                <div className="w-8 h-[2px] bg-slate-200 dark:bg-[#2a2a2e] rounded-full my-1" />

                <button
                    title="Browse all communities"
                    className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-white dark:bg-[#2a2a2e] text-green-600 flex items-center justify-center transition-all duration-300 shadow-sm border border-slate-200 dark:border-transparent hover:bg-green-500 hover:text-white dark:hover:bg-green-500"
                >
                    <Plus size={24} />
                </button>

                <div className="mt-auto pt-2">
                    <Link
                        to="/announcements"
                        className="flex items-center justify-center w-10 h-10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors rounded-xl hover:bg-slate-200 dark:hover:bg-[#2a2a2e]"
                        title="Home"
                    >
                        <Home size={20} />
                    </Link>
                </div>
            </div>

            {/* Channels column */}
            <div className="w-64 flex-shrink-0 bg-slate-50 dark:bg-[#1c1c1f] border-r border-slate-200 dark:border-[#2a2a2e] flex flex-col">

                {/* Space header */}
                <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-[#2a2a2e] shadow-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-[#2a2a2e] transition-colors">
                    <h2 className="font-bold text-slate-900 dark:text-white truncate">{activeSpace?.name ?? 'Community'}</h2>
                    <ChevronDown size={18} className="text-slate-500 dark:text-slate-400 flex-shrink-0" />
                </div>

                {/* Channel list */}
                <div className="flex-1 overflow-y-auto p-3 space-y-0.5 custom-scrollbar">

                    {channelsLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 size={20} className="animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <>
                            {/* Text channels */}
                            {textChannels.length > 0 && (
                                <>
                                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 mt-3 px-2 flex items-center justify-between group">
                                        Text Channels
                                        <button onClick={onAddChannel} className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-slate-700 dark:hover:text-white">
                                            <Plus size={14} />
                                        </button>
                                    </p>
                                    {textChannels.map(channel => (
                                        <ChannelRow
                                            key={channel.id}
                                            channel={channel}
                                            isActive={activeChannelId === channel.id}
                                            onClick={() => setActiveChannelId(channel.id)}
                                        />
                                    ))}
                                </>
                            )}

                            {/* Voice channels */}
                            {voiceChannels.length > 0 && (
                                <>
                                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 mt-4 px-2">
                                        Voice Channels
                                    </p>
                                    {voiceChannels.map(channel => (
                                        <ChannelRow
                                            key={channel.id}
                                            channel={channel}
                                            isActive={activeChannelId === channel.id}
                                            onClick={() => setActiveChannelId(channel.id)}
                                        />
                                    ))}
                                </>
                            )}

                            {/* Empty state */}
                            {channels.length === 0 && (
                                <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                                    <Hash size={32} className="mx-auto mb-2 opacity-40" />
                                    <p className="text-sm">No channels yet</p>
                                    <button onClick={onAddChannel} className="text-xs text-blue-500 hover:underline mt-1">
                                        Create one
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Current user mini profile */}
                <div className="h-16 bg-slate-100 dark:bg-[#161619] p-2 flex items-center justify-between border-t border-slate-200 dark:border-[#2a2a2e] shrink-0">
                    <div className="flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-[#2a2a2e] p-1.5 rounded-md cursor-pointer transition-colors flex-1 overflow-hidden">
                        <div className="relative">
                            <img
                                src={currentUserAvatar ?? `https://ui-avatars.com/api/?name=${currentUserName}`}
                                className="w-8 h-8 rounded-full"
                                alt="me"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-slate-100 dark:border-[#161619] rounded-full" />
                        </div>
                        <div className="flex flex-col truncate">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUserName}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">Online</span>
                        </div>
                    </div>
                    <button
                        onClick={onOpenSettings}
                        className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-200 dark:hover:bg-[#2a2a2e] transition-colors"
                    >
                        <Settings size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function ChannelRow({ channel, isActive, onClick }: {
    channel: CommunityChannel;
    isActive: boolean;
    onClick: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors group ${
                isActive
                    ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2a2a2e] hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
            <div className="flex items-center gap-2 truncate">
                {channelIcon(channel.type)}
                <span className="font-medium text-sm truncate">{channel.name}</span>
            </div>
            {channel.unreadCount && channel.unreadCount > 0 && !isActive && (
                <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                    {channel.unreadCount}
                </div>
            )}
        </div>
    );
}