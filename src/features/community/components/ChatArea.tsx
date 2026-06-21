import { useEffect, useRef, useState } from 'react';
import { Hash, Search, Users, Smile, Send, X, FileText, Menu, Paperclip } from 'lucide-react';
import type { CommunityChannel, MessageDto, CourseMemberDto } from '../types/communityTypes';
import { useMessages } from '../hooks/useMessages';
import type { ConnectionState } from '../hooks/useSignalR';
import MessageItem from './MessageItem';
import { useTranslation } from 'react-i18next';

interface ChatAreaProps {
    channel: CommunityChannel | null;
    currentUserAvatar?: string;
    currentUserId: string;
    currentUserName: string;
    onToggleMembers: () => void;
    onToggleSidebar?: () => void;
    onOpenSettings?: () => void;
    showMembers: boolean;
    members?: CourseMemberDto[];
    unreadCount?: number;
    sendMessage: (content: string, replyToMessageId?: number) => Promise<void>;
    connectionState: ConnectionState;
    // onRegisterMessageHandler: (handler: (msg: MessageDto) => void) => void;
    lastReceivedMessage?: { msg: MessageDto; seq: number } | null;
}

const EMOJIS = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '😢', '🙏', '😎', '👏'];

export default function ChatArea({
    channel,
    currentUserId,
    onToggleMembers,
    onToggleSidebar,
    currentUserAvatar,
    showMembers,
    onOpenSettings,
    members,
    currentUserName,
    sendMessage,
    connectionState,
    // onRegisterMessageHandler,
    lastReceivedMessage,
}: ChatAreaProps) {
    const { t } = useTranslation();
    const [messageText, setMessageText] = useState('');
    const [replyTo, setReplyTo] = useState<MessageDto | null>(null);
    const [showEmoji, setShowEmoji] = useState(false);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const topSentinelRef = useRef<HTMLDivElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const channelId = channel ? Number(channel.id) : null;
    const [firstUnreadId, setFirstUnreadId] = useState<number | null>(null);
    // const hasCalculatedUnreadRef = useRef(false);
    const calculatedForChannelRef = useRef<number | null>(null);
    const {
        messages, loading, loadingMore, hasMore,
        loadMore, appendMessage, handleEdit, handleDelete,
    } = useMessages(channelId);
    // Register appendMessage handler with parent so SignalR messages flow in
    // useEffect(() => {
    //     onRegisterMessageHandler((msg: MessageDto) => {
    //         if (msg.channelId === channelId) {
    //             appendMessage(msg);
    //         }
    //     });
    // }, [channelId, appendMessage]);

    // useEffect(() => {
    //     if (!lastReceivedMessage) return;
    //     if (lastReceivedMessage.msg.channelId === channelId) {
    //         appendMessage(lastReceivedMessage.msg);
    //     }
    // }, [lastReceivedMessage?.seq]);
const appendMessageRef = useRef(appendMessage);
useEffect(() => { 
    appendMessageRef.current = appendMessage; 
}, [appendMessage]);

// Keep a ref so the effect below always reads the CURRENT channelId
// even though its dependency array only tracks `seq`.
const channelIdRef = useRef(channelId);
useEffect(() => { channelIdRef.current = channelId; }, [channelId]);

useEffect(() => {
    if (!lastReceivedMessage) return;
    if (lastReceivedMessage.msg.channelId === channelIdRef.current) {
        appendMessageRef.current(lastReceivedMessage.msg);
    }
}, [lastReceivedMessage?.seq]);

const BASE_URL = 'https://neura-brhac2ghgvdtbggn.francecentral-01.azurewebsites.net/';

const toFullUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return BASE_URL + url;
};
    const enrichedMessages = messages.map(msg => {
    const member = members?.find(m => m.userId === msg.senderId);
    const isCurrentUser = msg.senderId === currentUserId;
    return {
        ...msg,
        senderName: msg.senderName && !msg.senderName.includes('-')
            ? msg.senderName
            : (member?.displayName ?? (isCurrentUser ? currentUserName : msg.senderName)),
        senderAvatarUrl:
            toFullUrl(msg.senderAvatarUrl)
            || (isCurrentUser ? currentUserAvatar : null)
            || toFullUrl(member?.avatarUrl)
            || null,
    };
});

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) loadMore();
        }, { threshold: 0.1 });
        if (topSentinelRef.current) observer.observe(topSentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, loadMore]);

    // Reset the unread flag when channel changes
    // useEffect(() => {
    //     hasCalculatedUnreadRef.current = false;
    //     setFirstUnreadId(null);
    // }, [channelId]);

    // Calculate firstUnreadId only ONCE when entering a channel (not on every new message)
    // useEffect(() => {
    //     if (!channelId || messages.length === 0 || hasCalculatedUnreadRef.current) return;
    //     hasCalculatedUnreadRef.current = true;
    //     const lastSeenId = Number(localStorage.getItem(`last_seen_${channelId}`) ?? 0);
    //     // if (lastSeenId === 0) return;
    //     const firstUnread = messages.find(m => m.id > lastSeenId && m.senderId !== currentUserId);
    //      console.log(' Unread calc:', {
    //     channelId,
    //     lastSeenId,
    //     messagesCount: messages.length,
    //     firstUnread: firstUnread?.id ?? null,
    //     allIds: messages.map(m => m.id),
    //     currentUserId,
    // });
    
    //     setFirstUnreadId(firstUnread?.id ?? null);
    // }, [channelId, messages.length]);

useEffect(() => {
    // Reset when channel changes
    setFirstUnreadId(null);
    calculatedForChannelRef.current = null; 

    if (!channelId || messages.length === 0) return;
    if (calculatedForChannelRef.current === channelId) return;
    calculatedForChannelRef.current = channelId;

    const lastSeenId = Number(localStorage.getItem(`last_seen_${channelId}`) ?? 0);
    const firstUnread = messages.find(m => 
        m.id > lastSeenId && 
        m.senderId !== currentUserId &&
        m.id < 100_000_000  // skip optimistic messages
    );

    console.log(' Unread calc:', { channelId, lastSeenId, firstUnread: firstUnread?.id ?? null });
    setFirstUnreadId(firstUnread?.id ?? null);
}, [channelId, messages.length]);

    // After 2 seconds of viewing, mark all messages as read and clear the red line
    // useEffect(() => {
    //     if (!channelId || messages.length === 0) return;
    //     const timer = setTimeout(() => {
    //         const lastMsg = messages[messages.length - 1];
    //         if (lastMsg) {
    //             localStorage.setItem(`last_seen_${channelId}`, String(lastMsg.id));
    //             // setFirstUnreadId(null); // clear the red "New Messages" line
    //         }
    //     }, 2000);
    //     return () => clearTimeout(timer);
    // }, [channelId, messages.length]);

    useEffect(() => {
        if (!showEmoji) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
                setShowEmoji(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showEmoji]);

    useEffect(() => {
        return () => {
            if (!channelId || messages.length === 0) return;
            const realMessages = messages.filter(m => m.id < 100_000_000);
            const lastMsg = realMessages[realMessages.length - 1];
            if (lastMsg) localStorage.setItem(`last_seen_${channelId}`, String(lastMsg.id));
        };
    }, [channelId, messages]);

    const handleSend = async () => {
        const content = messageText.trim();
        if ((!content && !attachedFile) || !channel) return;

        const tempId = Date.now();
        const optimisticMsg: MessageDto = {
            id: tempId,
            channelId: Number(channel.id),
            senderId: currentUserId,
            senderName: currentUserName,
            senderAvatarUrl: currentUserAvatar ?? null,
            content,
            sentAt: new Date().toISOString(),
            editedAt: null,
            isDeleted: false,
            replyToMessageId: replyTo?.id ?? null,
            replyPreview: replyTo ? {
                id: replyTo.id,
                senderName: replyTo.senderName,
                contentPreview: replyTo.content,
            } : null,
        };
        setFirstUnreadId(null);
        appendMessage(optimisticMsg);
        setMessageText('');
        setReplyTo(null);
        setAttachedFile(null);

        try {
            await sendMessage(content, replyTo?.id);
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    const isConnected = connectionState === 'connected';
    const canSend = !!channel && isConnected && (messageText.trim().length > 0 || !!attachedFile);

    const fileInputRef = useRef<HTMLInputElement>(null);

const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachedFile(file);
    e.target.value = ''; 
};

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#1a1a1a]">
            <div className="h-14 flex flex-shrink-0 items-center justify-between px-4 border-b border-slate-200 dark:border-[#2a2a2e] shadow-sm">
               <div className="flex items-center gap-2 text-slate-900 dark:text-white min-w-0">
                    <button onClick={onToggleSidebar} className="md:hidden p-1.5 -ml-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-[#2a2a2e] flex-shrink-0">
                        <Menu size={20} />
                    </button>
                    <Hash size={20} className="text-slate-400 flex-shrink-0" />
                    <h3 className="font-bold truncate">{channel?.name ?? t('community.selectChannel')}</h3>
                    {channel?.topic && (
                        <>
                            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1 hidden sm:block flex-shrink-0" />
                            <span className="text-sm text-slate-400 truncate max-w-[100px] sm:max-w-xs hidden sm:block">{channel.topic}</span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-1.5 sm:gap-3 text-slate-500 dark:text-slate-400 flex-shrink-0">
                    <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : connectionState === 'reconnecting' ? 'bg-yellow-500 animate-pulse' : 'bg-slate-400'}`} />
                        <span className="text-xs hidden md:block text-slate-400">
                            {isConnected ? t('community.live') : connectionState}
                        </span>
                    </div>
                    <div className="relative hidden md:block">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4" />
                        <input type="text" placeholder={t('community.searchMessages')}
                            className="bg-slate-100 dark:bg-[#2a2a2e] text-sm rounded-md pl-8 pr-2 py-1 w-44 outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white" />
                    </div>
                    <button onClick={onToggleMembers}
                        className={`p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#2a2a2e] transition-colors ${showMembers ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                        <Users size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-1 custom-scrollbar">
                <div ref={topSentinelRef} className="h-1" />
                {loadingMore && (
                    <div className="flex justify-center py-2">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                {!loading && !hasMore && (
                    <div className="mt-8 mb-8">
                        <div className="w-16 h-16 bg-slate-200 dark:bg-[#2a2a2e] rounded-full flex items-center justify-center mb-4">
                            <Hash size={32} className="text-slate-500 dark:text-slate-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{t('community.beginningOf', { channel: channel?.name })}</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{t('community.beginningOf', { channel: channel?.name })}</p>
                    </div>
                )}
                {loading && (
                    <div className="space-y-4 mt-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex gap-4 px-2 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#2a2a2e] flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-32 bg-slate-200 dark:bg-[#2a2a2e] rounded" />
                                    <div className="h-3 w-64 bg-slate-200 dark:bg-[#2a2a2e] rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {!loading && messages.length > 0 && (
                    <div className="relative flex items-center py-2">
                        <div className="flex-1 border-t border-slate-200 dark:border-[#2a2a2e]" />
                        <span className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500">{t('community.today')}</span>
                        <div className="flex-1 border-t border-slate-200 dark:border-[#2a2a2e]" />
                    </div>
                )}
                {enrichedMessages.map(msg => (
                    <div key={msg.id}>
                        {msg.id === firstUnreadId && (
                            <div className="relative flex items-center py-2 my-2">
                                <div className="flex-1 border-t border-red-400 dark:border-red-500" />
                                <span className="px-3 text-xs font-semibold text-red-400 dark:text-red-500 bg-white dark:bg-[#1a1a1a]">{t('community.newMessages')}</span>
                                <div className="flex-1 border-t border-red-400 dark:border-red-500" />
                            </div>
                        )}
                        <MessageItem
                            message={msg}
                            isOwnMessage={msg.senderId === currentUserId}
                            currentUserAvatar={currentUserAvatar}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onReply={setReplyTo}
                            onOpenSettings={onOpenSettings}
                        />
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {replyTo && (
                <div className="mx-4 px-4 py-2 bg-slate-100 dark:bg-[#2a2a2e] rounded-t-lg border-t border-x border-slate-200 dark:border-[#3a3a3e] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-0.5 h-4 bg-blue-500 rounded-full" />
                        <span className="text-slate-500 dark:text-slate-400">
                            {t('community.replyingTo')} <span className="font-semibold text-slate-700 dark:text-slate-200">{replyTo.senderName}</span>
                        </span>
                        <span className="text-slate-400 truncate max-w-xs">{replyTo.content}</span>
                    </div>
                    <button onClick={() => setReplyTo(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white"><X size={14} /></button>
                </div>
            )}

            {attachedFile && (
                <div className="mx-4 px-4 py-2 bg-slate-100 dark:bg-[#2a2a2e] rounded-t-lg border-t border-x border-slate-200 dark:border-[#3a3a3e] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm min-w-0">
                        <FileText size={16} className="text-blue-500 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-200 truncate">{attachedFile.name}</span>
                        <span className="text-slate-400 text-xs flex-shrink-0">({Math.ceil(attachedFile.size / 1024)} KB)</span>
                    </div>
                    <button onClick={() => setAttachedFile(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white flex-shrink-0"><X size={14} /></button>
                </div>
            )}

            <div className={`p-2 sm:p-4 flex-shrink-0 ${(replyTo || attachedFile) ? 'pt-0' : ''}`}>
                 <div className="bg-slate-100 dark:bg-[#2a2a2e] rounded-xl flex items-center px-4 py-2 border border-transparent focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-sm">
                    <input type="text" value={messageText}
                        onChange={e => setMessageText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder={channel ? t('community.messagePlaceholder', { channel: channel.name }) : t('community.selectChannel')}
                        className="flex-1 bg-transparent outline-none px-2 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400" />
                    <div className="flex items-center gap-2">
                            {/* Hidden file input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                                accept="image/*,.pdf,.doc,.docx"
                            />

                            {/* Attach button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-slate-400 hover:text-blue-500 transition-colors hidden sm:block"
                                title="Attach file"
                            >
                                <Paperclip size={20} />
                            </button>

                            {/* Emoji button + picker */}
                            <div className="relative" ref={emojiPickerRef}>
                                <button type="button" onClick={() => setShowEmoji(v => !v)}
                                    className="p-2 text-slate-400 hover:text-yellow-500 transition-colors hidden sm:block">
                                    <Smile size={20} />
                                </button>
                                {showEmoji && (
                                    <div className="absolute bottom-12 right-0 bg-white dark:bg-[#2a2a2e] border border-slate-200 dark:border-[#3a3a3e] rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1 z-20 w-56 max-w-[80vw]">
                                        {EMOJIS.map(emoji => (
                                            <button key={emoji} type="button"
                                                onClick={() => { setMessageText(t => t + emoji); setShowEmoji(false); }}
                                                className="text-xl hover:bg-slate-100 dark:hover:bg-[#3a3a3e] rounded p-1.5 flex items-center justify-center">
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Send button */}
                            {(messageText.trim() || attachedFile) && (
                                <button type="button" onClick={handleSend} disabled={!canSend}
                                    className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
                                    <Send size={18} />
                                </button>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
}