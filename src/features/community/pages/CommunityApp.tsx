import { useState, useEffect } from 'react';
import CommunitySidebar from '../components/CommunitySidebar';
import ChatArea from '../components/ChatArea';
import MembersList from '../components/MembersList';
import { useChannels } from '../hooks/useChannels';
import { useMembers } from '../hooks/useMembers';
import { useSpaces } from '../hooks/useSpaces';
import { useAuth } from '../../auth/hooks/useAuth';
import type { CommunityChannel } from '../types/communityTypes';
import { Loader2 } from 'lucide-react';
import CreateChannelModal from '../components/CreateChannelModal';
import UserSettingsModal from '../components/UserSettingsModal';

export default function CommunityApp() {
    //  Auth 
    const { user } = useAuth();
    const currentUserId     = user?.id ?? '';
    const currentUserName   = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.userName ?? 'You';
    const currentUserAvatar = user?.imageUrl
        ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}`;

    const { spaces, loading: spacesLoading } = useSpaces();

    const [activeSpaceId,   setActiveSpaceId]   = useState<string>('');
    const [activeChannelId, setActiveChannelId] = useState<string>('');
    const [showMembers,     setShowMembers]     = useState(true);

    useEffect(() => {
        if (spaces.length > 0 && !activeSpaceId) {
            setActiveSpaceId(spaces[0].id);
        }
    }, [spaces, activeSpaceId]);

    const courseId = activeSpaceId || null;

    const { channels, loading: channelsLoading, addChannel } = useChannels(courseId);
    const { members, loading: membersLoading } = useMembers(courseId);

    // Auto-select first channel
    useEffect(() => {
        if (channels.length > 0 && !channels.find(c => String(c.id) === activeChannelId)) {
            setActiveChannelId(String(channels[0].id));
        }
    }, [channels, activeChannelId]);

    // Map ChannelDto to CommunityChannel for ChatArea
    const activeChannel: CommunityChannel | null = (() => {
        const ch = channels.find(c => String(c.id) === activeChannelId);
        if (!ch) return null;
        return {
            id:      String(ch.id),
            spaceId: activeSpaceId,
            name:    ch.name ?? 'channel',
            type:    ch.type === 1 ? 'voice' : 'text',
            topic:   ch.topic ?? undefined,
        };
    })();

    const [showCreateChannel, setShowCreateChannel] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    //  Loading state 
    if (spacesLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0e0e10]">
                <Loader2 size={32} className="animate-spin text-blue-500" />
            </div>
        );
    }

    if (spaces.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0e0e10] flex-col gap-3">
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                    You're not enrolled in any courses yet.
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-sm">
                    Enroll in a course to access its community.
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-white dark:bg-[#0e0e10] font-sans overflow-hidden">

            <CommunitySidebar
                spaces={spaces}
                activeSpaceId={activeSpaceId}
                setActiveSpaceId={id => { setActiveSpaceId(id); setActiveChannelId(''); }}
                activeChannelId={activeChannelId}
                setActiveChannelId={setActiveChannelId}
                channels={channels.map(c => ({
                    id:       String(c.id),
                    spaceId:  activeSpaceId,
                    name:     c.name ?? 'channel',
                    type:     c.type === 1 ? 'voice' : 'text',
                    topic:    c.topic ?? undefined,
                    position: c.position,
                }))}
                channelsLoading={channelsLoading}
                onAddChannel={() => setShowCreateChannel(true)}
                currentUserName={currentUserName}
                currentUserAvatar={currentUserAvatar}
                onOpenSettings={() => setShowSettings(true)}
            />
            
            <ChatArea
                channel={activeChannel}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                onToggleMembers={() => setShowMembers(v => !v)}
                showMembers={showMembers}
            />

            {showMembers && (
                <MembersList members={members} loading={membersLoading} />
            )}
            {showCreateChannel && (
                <CreateChannelModal
                    onClose={() => setShowCreateChannel(false)}
                    onCreate={(name, type) => addChannel(name, type).then(() => {})}
                />
             )}
             {showSettings && (
                <UserSettingsModal
                    onClose={() => setShowSettings(false)}
                    currentUserName={currentUserName}
                    currentUserAvatar={currentUserAvatar}
                />
            )}
        </div>
    );
}