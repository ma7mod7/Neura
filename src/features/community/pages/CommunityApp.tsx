// src/pages/Community/CommunityApp.tsx
import  { useState, useRef, useEffect } from 'react';
import {
    Hash, Search, Users, Smile, Paperclip, Send, Shield, MoreVertical,
    Plus
} from 'lucide-react';
import type { CommunityMember, CommunityMessage, CommunitySpace } from '../types/communityTypes';
import CommunitySidebar from '../components/CommunitySidebar';

// --- MOCK DATA (Until Backend is Ready) ---
const MOCK_SPACES: CommunitySpace[] = [
    {
        id: 's1', name: 'Frontend Bootcamp', imageUrl: 'https://ui-avatars.com/api/?name=FB&background=0D8ABC&color=fff', isPrivate: false, channels: [
            { id: 'c1', spaceId: 's1', name: 'general', type: 'text' },
            { id: 'c2', spaceId: 's1', name: 'help-react', type: 'text', unreadCount: 3 },
            { id: 'c3', spaceId: 's1', name: 'Study Room', type: 'voice' },
        ]
    },
    {
        id: 's2', name: 'Teachers Lounge', imageUrl: 'https://ui-avatars.com/api/?name=TL&background=f59e0b&color=fff', isPrivate: true, channels: [
            { id: 'c4', spaceId: 's2', name: 'announcements', type: 'announcement' },
            { id: 'c5', spaceId: 's2', name: 'curriculum-planning', type: 'text' },
        ]
    }
];

const MOCK_MESSAGES: CommunityMessage[] = [
    { id: 'm1', channelId: 'c1', senderId: 'u1', senderName: 'Mahmoud Emad', senderAvatar: 'https://ui-avatars.com/api/?name=Mahmoud+Emad', content: 'Welcome to the new community platform guys! 🚀', timestamp: new Date().toISOString() },
    { id: 'm2', channelId: 'c1', senderId: 'u2', senderName: 'Ahmed Ali', senderAvatar: 'https://ui-avatars.com/api/?name=Ahmed+Ali', content: 'This looks amazing! Much better than the old forum.', timestamp: new Date(Date.now() - 60000).toISOString() },
];

const MOCK_MEMBERS: CommunityMember[] = [
    { id: 'u1', name: 'Mahmoud Emad', role: 'admin', status: 'online' },
    { id: 'u2', name: 'Ahmed Ali', role: 'student', status: 'idle' },
    { id: 'u3', name: 'Sara Kamel', role: 'student', status: 'dnd' },
    { id: 'u4', name: 'Dr. Ehab', role: 'teacher', status: 'offline' },
];

export default function CommunityApp() {
    // --- State Management ---
    const [activeSpaceId, setActiveSpaceId] = useState<string>(MOCK_SPACES[0].id);
    const [activeChannelId, setActiveChannelId] = useState<string>(MOCK_SPACES[0].channels[0].id);
    const [showMembers, setShowMembers] = useState<boolean>(true);
    const [messageText, setMessageText] = useState("");

    const [messages, setMessages] = useState<CommunityMessage[]>(MOCK_MESSAGES);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeSpace = MOCK_SPACES.find(s => s.id === activeSpaceId);
    const activeChannel = activeSpace?.channels.find(c => c.id === activeChannelId);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // --- Handlers ---
    const handleSendMessage = () => {
        if (!messageText.trim() || !activeChannel) return;

        const newMsg: CommunityMessage = {
            id: Date.now().toString(),
            channelId: activeChannel.id,
            senderId: 'currentUser',
            senderName: 'Mahmoud Emad',
            senderAvatar: 'https://ui-avatars.com/api/?name=User',
            content: messageText,
            timestamp: new Date().toISOString()
        };

        setMessages([...messages, newMsg]);
        setMessageText("");
        // TODO: Send via WebSockets (SignalR) when backend is ready
    };

    // Status Color Helper
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'bg-green-500';
            case 'idle': return 'bg-yellow-500';
            case 'dnd': return 'bg-red-500';
            default: return 'bg-gray-400';
        }
    };

    return (
        // 💡 Notice: We fill the entire screen (h-screen)
        <div className="flex h-screen bg-white dark:bg-[#0e0e10] font-sans overflow-hidden">

            {/* 1. & 2. The Community Sidebar Component */}
            <CommunitySidebar
                spaces={MOCK_SPACES}
                activeSpaceId={activeSpaceId}
                setActiveSpaceId={setActiveSpaceId}
                activeChannelId={activeChannelId}
                setActiveChannelId={setActiveChannelId}
            />

            {/* 3. CENTER: Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#1A1A1A]">

                {/* Chat Header */}
                <div className="h-14 flex flex-shrink-0 items-center justify-between px-4 border-b border-slate-200 dark:border-[#2a2a2e] shadow-sm">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <Hash size={20} className="text-slate-400" />
                        <h3 className="font-bold">{activeChannel?.name || "Select a channel"}</h3>
                    </div>

                    {/* Header Toolbar */}
                    <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4" />
                            <input type="text" placeholder="Search" className="bg-slate-100 dark:bg-[#2a2a2e] text-sm rounded-md pl-8 pr-2 py-1 w-48 outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white transition-all" />
                        </div>
                        <button onClick={() => setShowMembers(!showMembers)} className={`p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#2a2a2e] transition-colors ${showMembers ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                            <Users size={20} />
                        </button>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">

                    {/* Welcome Message Placeholder */}
                    <div className="mt-8 mb-8">
                        <div className="w-16 h-16 bg-slate-200 dark:bg-[#2a2a2e] rounded-full flex items-center justify-center mb-4">
                            <Hash size={32} className="text-slate-500 dark:text-slate-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome to #{activeChannel?.name}!</h1>
                        <p className="text-slate-500 dark:text-slate-400">This is the start of the #{activeChannel?.name} channel.</p>
                    </div>

                    <div className="border-t border-slate-200 dark:border-[#2a2a2e] my-4 relative">
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#1A1A1A] px-2 text-xs font-semibold text-slate-400">Today</span>
                    </div>

                    {/* Mapping Messages */}
                    {messages.map((msg) => (
                        <div key={msg.id} className="flex gap-4 hover:bg-slate-50 dark:hover:bg-[#1c1c1f] p-1 -mx-2 px-2 rounded-md transition-colors group">
                            <img src={msg.senderAvatar} alt={msg.senderName} className="w-10 h-10 rounded-full mt-0.5 cursor-pointer hover:opacity-80 border border-slate-200 dark:border-slate-700" />
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="font-medium text-slate-900 dark:text-white hover:underline cursor-pointer">{msg.senderName}</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed">{msg.content}</p>
                            </div>

                            {/* Message Hover Actions */}
                            <div className="opacity-0 group-hover:opacity-100 flex items-center bg-white dark:bg-[#2a2a2e] border border-slate-200 dark:border-[#3a3a3e] rounded-md shadow-sm absolute right-4 -mt-2">
                                <button className="p-1.5 text-slate-500 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-[#3a3a3e] transition-colors"><Smile size={16} /></button>
                                <button className="p-1.5 text-slate-500 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-[#3a3a3e] transition-colors"><MoreVertical size={16} /></button>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 flex-shrink-0">
                    <div className="bg-slate-100 dark:bg-[#2a2a2e] rounded-xl flex items-center px-4 py-2 border border-transparent focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-sm">
                        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            <Plus size={20} className="bg-slate-300 dark:bg-[#3a3a3e] rounded-full p-0.5" />
                        </button>
                        <input
                            type="text"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder={`Message #${activeChannel?.name || "..."}`}
                            className="flex-1 bg-transparent outline-none px-2 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                        />
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-400 hover:text-yellow-500 transition-colors hidden sm:block"><Smile size={20} /></button>
                            {messageText.trim() ? (
                                <button onClick={handleSendMessage} className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm animate-in zoom-in">
                                    <Send size={18} />
                                </button>
                            ) : (
                                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><Paperclip size={20} /></button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. FAR RIGHT: Members Sidebar */}
            {showMembers && (
                <div className="w-60 flex-shrink-0 bg-slate-50 dark:bg-[#1c1c1f] border-l border-slate-200 dark:border-[#2a2a2e] flex flex-col z-10 animate-in slide-in-from-right-10 duration-200">
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">

                        {/* Admins & Teachers */}
                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Admins — 1</h3>
                        <div className="space-y-1 mb-6">
                            {MOCK_MEMBERS.filter(m => m.role === 'admin' || m.role === 'teacher').map(member => (
                                <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-slate-200 dark:hover:bg-[#2a2a2e] rounded-md cursor-pointer transition-colors group">
                                    <div className="relative">
                                        <img src={`https://ui-avatars.com/api/?name=${member.name}`} className="w-8 h-8 rounded-full" alt={member.name} />
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-slate-50 dark:border-[#1c1c1f] rounded-full group-hover:border-slate-200 dark:group-hover:border-[#2a2a2e] ${getStatusColor(member.status)}`} />
                                    </div>
                                    <span className="font-medium text-sm text-amber-600 dark:text-amber-500 truncate">{member.name}</span>
                                    {member.role === 'admin' && <Shield size={12} className="text-amber-500 ml-auto" />}
                                </div>
                            ))}
                        </div>

                        {/* Online Users */}
                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Online — 2</h3>
                        <div className="space-y-1 mb-6">
                            {MOCK_MEMBERS.filter(m => m.role === 'student' && m.status !== 'offline').map(member => (
                                <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-slate-200 dark:hover:bg-[#2a2a2e] rounded-md cursor-pointer transition-colors group">
                                    <div className="relative">
                                        <img src={`https://ui-avatars.com/api/?name=${member.name}`} className="w-8 h-8 rounded-full" alt={member.name} />
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-slate-50 dark:border-[#1c1c1f] rounded-full group-hover:border-slate-200 dark:group-hover:border-[#2a2a2e] ${getStatusColor(member.status)}`} />
                                    </div>
                                    <span className="font-medium text-sm text-slate-700 dark:text-slate-300 truncate group-hover:text-slate-900 dark:group-hover:text-white">{member.name}</span>
                                </div>
                            ))}
                        </div>

                        {/* Offline Users */}
                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Offline — 1</h3>
                        <div className="space-y-1 opacity-60">
                            {MOCK_MEMBERS.filter(m => m.status === 'offline').map(member => (
                                <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-slate-200 dark:hover:bg-[#2a2a2e] rounded-md cursor-pointer transition-colors group">
                                    <div className="relative">
                                        <img src={`https://ui-avatars.com/api/?name=${member.name}`} className="w-8 h-8 rounded-full grayscale" alt={member.name} />
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-slate-50 dark:border-[#1c1c1f] rounded-full group-hover:border-slate-200 dark:group-hover:border-[#2a2a2e] bg-transparent`} />
                                    </div>
                                    <span className="font-medium text-sm text-slate-700 dark:text-slate-300 truncate">{member.name}</span>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}