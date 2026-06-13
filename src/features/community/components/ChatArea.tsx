import { useEffect, useRef, useState } from 'react';
import { Hash, Search, Users, Smile, Paperclip, Send, Plus, X, FileText } from 'lucide-react';
import type { CommunityChannel, MessageDto ,CourseMemberDto} from '../types/communityTypes';
import { useMessages } from '../hooks/useMessages';
import { useSignalR } from '../hooks/useSignalR';
import MessageItem from './MessageItem';

interface ChatAreaProps {
    courseId: string | null;
    channel: CommunityChannel | null;
    channelIds?: number[];
    currentUserAvatar?: string;
    currentUserId: string;
    currentUserName: string;
    onToggleMembers: () => void;
    onOpenSettings?: () => void;
    onUnreadIncrement?: (channelId: number) => void;
    showMembers: boolean;
    members?: CourseMemberDto[];
    unreadCount?: number;
}

const EMOJIS = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '😢', '🙏', '😎', '👏'];

export default function ChatArea({
    channel,
    courseId,
    currentUserId,
    onToggleMembers,
    currentUserAvatar,
    showMembers,
    onOpenSettings,
    channelIds,
    onUnreadIncrement,
    currentUserName,
    members, 
}: ChatAreaProps) {
    const [messageText, setMessageText] = useState('');
    const [replyTo, setReplyTo] = useState<MessageDto | null>(null);
    const [showEmoji, setShowEmoji] = useState(false);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const topSentinelRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const channelId = channel ? Number(channel.id) : null;
    const channelIdRef = useRef(channelId);
    const [firstUnreadId, setFirstUnreadId] = useState<number | null>(null);

    useEffect(() => { channelIdRef.current = channelId; }, [channelId]);  

     const {
    messages, loading, loadingMore, hasMore,
    loadMore, appendMessage, handleEdit, handleDelete,
     } = useMessages(channelId);
    const enrichedMessages = messages.map(msg => {
        const member = members?.find(m => m.userId === msg.senderId);
        const isCurrentUser = msg.senderId === currentUserId;
        return {
            ...msg,
            senderName: msg.senderName && !msg.senderName.includes('-')
                ? msg.senderName
                : (member?.displayName ?? (isCurrentUser ? currentUserName : msg.senderName)),
            senderAvatarUrl: msg.senderAvatarUrl
                || (isCurrentUser ? currentUserAvatar : null)
                || member?.avatarUrl
                || null,
        };
    });
    
    const { sendMessage, connectionState } = useSignalR({
        courseId,
        channelIds: channelIds ?? (channelId ? [channelId] : []),
        activeChannelId: channelId,
        onMessageReceived: (msg) => {
            console.log('📨 ReceiveMessage fired, channelId:', msg.channelId, 'current:', channelIdRef.current);
            appendMessage(msg);  
        },
        onUnreadIncrement,
    });

    // Auto scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    // Infinite scroll --> load older messages when scrolling to top
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) loadMore();
        }, { threshold: 0.1 });
        if (topSentinelRef.current) observer.observe(topSentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, loadMore]);

    // Compute the "New Messages"
    useEffect(() => {
        if (!channelId || messages.length === 0) {
            setFirstUnreadId(null);
            return;
        }
        const lastSeenId = Number(localStorage.getItem(`last_seen_${channelId}`) ?? 0);
        if (lastSeenId === 0) {
            setFirstUnreadId(null);
            return;
        }
        const firstUnread = messages.find(m =>
            m.id > lastSeenId && m.senderId !== currentUserId
        );
        setFirstUnreadId(firstUnread?.id ?? null);
    }, [channelId, messages.length]);

    // Persist last-seen position after a short delay
    // (covers refreshing the page without switching channels)
    useEffect(() => {
        if (!channelId || messages.length === 0) return;
        const timer = setTimeout(() => {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg) {
                localStorage.setItem(`last_seen_${channelId}`, String(lastMsg.id));
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, [channelId, messages.length]);

    // Close emoji picker
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

    // Always sync last_seen to the live message list when leaving this channel
    // avoids a race with the async cache merge in useMessages
    useEffect(() => {
        return () => {
            if (!channelId || messages.length === 0) return;
            const lastMsg = messages[messages.length - 1];
            if (lastMsg) {
                localStorage.setItem(`last_seen_${channelId}`, String(lastMsg.id));
            }
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
    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAttachedFile(file);
        e.target.value = '';
    };

    const isConnected = connectionState === 'connected';
    const canSend = !!channel && isConnected && (messageText.trim().length > 0 || !!attachedFile);

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#1a1a1a]">

            {/* Chat Header */}
            <div className="h-14 flex flex-shrink-0 items-center justify-between px-4 border-b border-slate-200 dark:border-[#2a2a2e] shadow-sm">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <Hash size={20} className="text-slate-400" />
                    <h3 className="font-bold">{channel?.name ?? 'Select a channel'}</h3>
                    {channel?.topic && (
                        <>
                            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
                            <span className="text-sm text-slate-400 truncate max-w-xs">{channel.topic}</span>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    {/* Connection indicator */}
                    <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : connectionState === 'reconnecting' ? 'bg-yellow-500 animate-pulse' : 'bg-slate-400'}`} />
                        <span className="text-xs hidden md:block text-slate-400">
                            {isConnected ? 'Live' : connectionState}
                        </span>
                    </div>

                    <div className="relative hidden md:block">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search messages"
                            className="bg-slate-100 dark:bg-[#2a2a2e] text-sm rounded-md pl-8 pr-2 py-1 w-44 outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                        />
                    </div>
                    <button
                        onClick={onToggleMembers}
                        className={`p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#2a2a2e] transition-colors ${showMembers ? 'text-blue-600 dark:text-blue-400' : ''}`}
                    >
                        <Users size={20} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                <div ref={topSentinelRef} className="h-1" />

                {loadingMore && (
                    <div className="flex justify-center py-2">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* Channel welcome header */}
                {!loading && !hasMore && (
                    <div className="mt-8 mb-8">
                        <div className="w-16 h-16 bg-slate-200 dark:bg-[#2a2a2e] rounded-full flex items-center justify-center mb-4">
                            <Hash size={32} className="text-slate-500 dark:text-slate-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                            Welcome to #{channel?.name}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            This is the beginning of the #{channel?.name} channel.
                        </p>
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

                {/* Date separator  */}
                {!loading && messages.length > 0 && (
                    <div className="relative flex items-center py-2">
                        <div className="flex-1 border-t border-slate-200 dark:border-[#2a2a2e]" />
                        <span className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500">Today</span>
                        <div className="flex-1 border-t border-slate-200 dark:border-[#2a2a2e]" />
                    </div>
                )}

                {enrichedMessages.map(msg => (
                    <div key={msg.id}>
                        {msg.id === firstUnreadId && (
                            <div className="relative flex items-center py-2 my-2">
                                <div className="flex-1 border-t border-red-400 dark:border-red-500" />
                                <span className="px-3 text-xs font-semibold text-red-400 dark:text-red-500 bg-white dark:bg-[#1a1a1a]">
                                    New Messages
                                </span>
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

            {/* Reply Preview Bar */}
            {replyTo && (
                <div className="mx-4 px-4 py-2 bg-slate-100 dark:bg-[#2a2a2e] rounded-t-lg border-t border-x border-slate-200 dark:border-[#3a3a3e] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-0.5 h-4 bg-blue-500 rounded-full" />
                        <span className="text-slate-500 dark:text-slate-400">
                            Replying to <span className="font-semibold text-slate-700 dark:text-slate-200">{replyTo.senderName}</span>
                        </span>
                        <span className="text-slate-400 truncate max-w-xs">{replyTo.content}</span>
                    </div>
                    <button onClick={() => setReplyTo(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Attached File Preview Bar */}
            {attachedFile && (
                <div className="mx-4 px-4 py-2 bg-slate-100 dark:bg-[#2a2a2e] rounded-t-lg border-t border-x border-slate-200 dark:border-[#3a3a3e] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm min-w-0">
                        <FileText size={16} className="text-blue-500 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-200 truncate">{attachedFile.name}</span>
                        <span className="text-slate-400 text-xs flex-shrink-0">
                            ({Math.ceil(attachedFile.size / 1024)} KB)
                        </span>
                    </div>
                    <button onClick={() => setAttachedFile(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white flex-shrink-0">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Input Area */}
            <div className={`p-4 flex-shrink-0 ${(replyTo || attachedFile) ? 'pt-0' : ''}`}>

                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelected}
                />

                <div className="bg-slate-100 dark:bg-[#2a2a2e] rounded-xl flex items-center px-4 py-2 border border-transparent focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-sm">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <Plus size={20} className="bg-slate-300 dark:bg-[#3a3a3e] rounded-full p-0.5" />
                    </button>
                    <input
                        type="text"
                        value={messageText}
                        onChange={e => setMessageText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder={channel ? `Message #${channel.name}` : 'Select a channel'}
                        className="flex-1 bg-transparent outline-none px-2 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                    />
                    <div className="flex items-center gap-2">
                        {/* Emoji picker */}
                        <div className="relative" ref={emojiPickerRef}>
                            <button
                                type="button"
                                onClick={() => setShowEmoji(v => !v)}
                                className="p-2 text-slate-400 hover:text-yellow-500 transition-colors hidden sm:block"
                            >
                                <Smile size={20} />
                            </button>
                           {showEmoji && (
                                <div className="absolute bottom-12 right-0 bg-white dark:bg-[#2a2a2e] border border-slate-200 dark:border-[#3a3a3e] rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1 z-20 w-56">
                                    {EMOJIS.map(emoji => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => {
                                                setMessageText(t => t + emoji);
                                                setShowEmoji(false);
                                            }}
                                            className="text-xl hover:bg-slate-100 dark:hover:bg-[#3a3a3e] rounded p-1.5 flex items-center justify-center"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <Paperclip size={20} />
                        </button>

                        {(messageText.trim() || attachedFile) && (
                            <button
                                type="button"
                                onClick={handleSend}
                                disabled={!canSend}
                                className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                <Send size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}