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
    const { user } = useAuth();
    const currentUserId = user?.id ?? '';
    const currentUserName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.userName ?? 'You';
    const currentUserAvatar = user?.imageUrl
        ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}`;

    const { spaces, loading: spacesLoading } = useSpaces();
    const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
    const [activeSpaceId, setActiveSpaceId] = useState<string>('');
    const [activeChannelId, setActiveChannelId] = useState<string>('');
    const [showMembers, setShowMembers] = useState(true);
    const [initialized, setInitialized] = useState(false);
    const [showCreateChannel, setShowCreateChannel] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    // const activeSpace = spaces.find(s => s.id === activeSpaceId);
    // const numericCourseId = activeSpace?.numericId ?? null;

    const handleUnreadIncrement = (channelId: number) => {
        setUnreadCounts(prev => ({ ...prev, [channelId]: (prev[channelId] ?? 0) + 1 }));
    };

    // const markChannelRead = (channelId: string) => {
    //     const cached = JSON.parse(localStorage.getItem(`msg_cache_${channelId}`) ?? 'null');
    //     const lastMsg = cached?.messages?.[cached.messages.length - 1];
    //     if (lastMsg) {
    //         localStorage.setItem(`last_seen_${channelId}`, String(lastMsg.id));
    //     }
    //     setUnreadCounts(prev => ({ ...prev, [Number(channelId)]: 0 }));
    // };

    const handleSetActiveChannel = (id: string) => {
        if (activeChannelId && activeChannelId !== id) {
            // Write last_seen SYNCHRONOUSLY before switching so the
            // recalculation effect sees it already updated
            const cached = JSON.parse(localStorage.getItem(`msg_cache_${activeChannelId}`) ?? 'null');
            const lastMsg = cached?.messages?.[cached.messages.length - 1];
            if (lastMsg) {
                localStorage.setItem(`last_seen_${activeChannelId}`, String(lastMsg.id));
            }
            setUnreadCounts(prev => ({ ...prev, [Number(activeChannelId)]: 0 }));
        }
        setActiveChannelId(id);
    };

    const handleSetActiveSpace = (id: string) => {
        if (activeChannelId) {
            const cached = JSON.parse(localStorage.getItem(`msg_cache_${activeChannelId}`) ?? 'null');
            const lastMsg = cached?.messages?.[cached.messages.length - 1];
            if (lastMsg) {
                localStorage.setItem(`last_seen_${activeChannelId}`, String(lastMsg.id));
            }
            setUnreadCounts(prev => ({ ...prev, [Number(activeChannelId)]: 0 }));
        }
        setActiveSpaceId(id);
        setActiveChannelId('');
    };

    useEffect(() => {
        if (spaces.length > 0 && !activeSpaceId) {
            setActiveSpaceId(spaces[0].id);
        }
    }, [spaces, activeSpaceId]);

    useEffect(() => {
        setInitialized(false);
    }, [activeSpaceId]);

    const courseId = activeSpaceId || null;
    const { channels, loading: channelsLoading, addChannel } = useChannels(courseId);
    const { members, loading: membersLoading } = useMembers(courseId);

    // Auto-select first channel
    useEffect(() => {
        if (channelsLoading) return;
        if (channels.length > 0 && !channels.find(c => String(c.id) === activeChannelId)) {
            setActiveChannelId(String(channels[0].id));
        }
        if (channels.length === 0) setActiveChannelId('');
    }, [channels, activeChannelId, channelsLoading]);

    // Initialize cache for all channels once per space
    useEffect(() => {
        if (channelsLoading || channels.length === 0 || !currentUserId || initialized) return;

        const init = async () => {
            const { getMessages } = await import('../api/messagesApi');
            for (const c of channels) {
                const existing = localStorage.getItem(`msg_cache_${c.id}`);

                if (existing) {
                    if (!localStorage.getItem(`last_seen_${c.id}`)) {
                        const parsed = JSON.parse(existing);
                        const lastMsg = parsed?.messages?.[parsed.messages.length - 1];
                        if (lastMsg) {
                            localStorage.setItem(`last_seen_${c.id}`, String(lastMsg.id));
                        }
                    }
                    try {
                        const data = await getMessages(c.id, { pageSize: 50 });
                        const fresh = data.messages ?? [];
                        const parsed = JSON.parse(existing);
                        const lastCachedId = parsed?.messages?.[parsed.messages.length - 1]?.id ?? 0;
                        const newOnes = fresh.filter((m: any) => m.id > lastCachedId);
                        if (newOnes.length > 0) {
                            const merged = [...parsed.messages, ...newOnes];
                            localStorage.setItem(`msg_cache_${c.id}`, JSON.stringify({
                                messages: merged,
                                hasMore: data.hasMore,
                                nextCursor: data.nextCursor,
                            }));
                        }
                    } catch {}
                    continue;
                }

                try {
                    const data = await getMessages(c.id, { pageSize: 50 });
                    const msgs = data.messages ?? [];
                    if (msgs.length > 0) {
                        localStorage.setItem(`msg_cache_${c.id}`, JSON.stringify({
                            messages: msgs,
                            hasMore: data.hasMore,
                            nextCursor: data.nextCursor,
                        }));
                        if (!localStorage.getItem(`last_seen_${c.id}`)) {
                            const lastMsg = msgs[msgs.length - 1];
                            localStorage.setItem(`last_seen_${c.id}`, String(lastMsg.id));
                        }
                    }
                } catch {}
            }
            setInitialized(true);
        };

        init();
    }, [channelsLoading, channels.length, currentUserId, initialized]);

    // Calculate unread counts from cache
    useEffect(() => {
        if (!initialized || channels.length === 0 || !currentUserId) return;
        setUnreadCounts(prev => {
            const newCounts = { ...prev };
            channels.forEach(c => {
                // Never recalculate for active channel
                if (String(c.id) === activeChannelId) {
                    newCounts[c.id] = 0;
                    return;
                }
                // If already zero
                if (prev[c.id] === 0) return;

                const lastSeen = Number(localStorage.getItem(`last_seen_${c.id}`) ?? 0);
                if (lastSeen === 0) return;
                const cached = JSON.parse(localStorage.getItem(`msg_cache_${c.id}`) ?? 'null');
                if (!cached?.messages?.length) return;
                const unread = cached.messages.filter(
                    (m: any) => m.id > lastSeen && m.senderId !== currentUserId
                ).length;
                newCounts[c.id] = unread;
            });
            return newCounts;
        });
    }, [initialized, activeChannelId, channels.length, currentUserId]);

    const activeChannel: CommunityChannel | null = (() => {
        const ch = channels.find(c => String(c.id) === activeChannelId);
        if (!ch) return null;
        return {
            id: String(ch.id),
            spaceId: activeSpaceId,
            name: ch.name ?? 'channel',
            type: ch.type === 1 ? 'voice' : 'text',
            topic: ch.topic ?? undefined,
        };
    })();

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
                setActiveSpaceId={handleSetActiveSpace}
                activeChannelId={activeChannelId}
                setActiveChannelId={handleSetActiveChannel}
                channels={channels.map(c => ({
                    id: String(c.id),
                    spaceId: activeSpaceId,
                    name: c.name ?? 'channel',
                    type: c.type === 1 ? 'voice' : 'text',
                    topic: c.topic ?? undefined,
                    position: c.position,
                    unreadCount: unreadCounts[c.id] ?? 0,
                }))}
                channelsLoading={channelsLoading}
                onAddChannel={() => setShowCreateChannel(true)}
                currentUserName={currentUserName}
                currentUserAvatar={currentUserAvatar}
                onOpenSettings={() => setShowSettings(true)}
            />

            <ChatArea
                channel={activeChannel}
                courseId={activeSpaceId || null}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                currentUserAvatar={currentUserAvatar}
                onToggleMembers={() => setShowMembers(v => !v)}
                showMembers={showMembers}
                onOpenSettings={() => setShowSettings(true)}
                channelIds={channels.map(c => c.id)}
                onUnreadIncrement={handleUnreadIncrement}
                members={members}
                unreadCount={unreadCounts[Number(activeChannelId)] ?? 0}
            />

            {showMembers && (
                <MembersList
                    members={members}
                    loading={membersLoading}
                    currentUserId={currentUserId}
                    currentUserAvatar={currentUserAvatar}
                />
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