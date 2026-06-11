import { useState } from 'react';
import { Smile, MoreVertical, Reply, Edit2, Trash2 } from 'lucide-react';
import type { MessageDto } from '../types/communityTypes';

interface MessageItemProps {
    message: MessageDto;
    isOwnMessage: boolean;
    onEdit?: (messageId: number, newContent: string) => void;
    onDelete?: (messageId: number) => void;
    onReply?: (message: MessageDto) => void;
}

export default function MessageItem({ message, isOwnMessage, onEdit, onDelete, onReply }: MessageItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content ?? '');
    const [showActions, setShowActions] = useState(false);

    const handleEditSubmit = () => {
        if (!editContent.trim() || !message.content || editContent === message.content) {
            setIsEditing(false);
            return;
        }
        onEdit?.(message.id, editContent);
        setIsEditing(false);
    };

    if (message.isDeleted) {
        return (
            <div className="flex gap-4 px-2 py-1">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#2a2a2e] flex-shrink-0" />
                <div className="flex-1">
                    <p className="text-slate-400 dark:text-slate-600 italic text-sm">
                        This message was deleted.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex gap-4 hover:bg-slate-50 dark:hover:bg-[#1c1c1f] px-2 py-1 -mx-2 rounded-md transition-colors group relative"
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {/* Avatar */}
            <img
                src={message.senderAvatarUrl ?? `https://ui-avatars.com/api/?name=${message.senderName}`}
                alt={message.senderName ?? 'User'}
                className="w-10 h-10 rounded-full mt-0.5 cursor-pointer hover:opacity-80 border border-slate-200 dark:border-slate-700 flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
                {/* Reply preview */}
                {message.replyPreview && (
                    <div className="flex items-center gap-2 mb-1 text-xs text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">
                        <div className="w-0.5 h-4 bg-slate-400 dark:bg-slate-500 rounded-full" />
                        <span className="font-semibold">{message.replyPreview.senderName}</span>
                        <span className="truncate max-w-xs">{message.replyPreview.contentPreview}</span>
                    </div>
                )}

                {/* Name + timestamp */}
                <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white hover:underline cursor-pointer">
                        {message.senderName}
                    </span>
                    <span className="text-xs text-slate-400">
                        {new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.editedAt && (
                        <span className="text-[10px] text-slate-400 italic">(edited)</span>
                    )}
                </div>

                {/* Content or Edit Input */}
                {isEditing ? (
                    <div className="mt-1">
                        <input
                            autoFocus
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') handleEditSubmit();
                                if (e.key === 'Escape') setIsEditing(false);
                            }}
                            className="w-full bg-white dark:bg-[#2a2a2e] border border-blue-400 rounded-md px-3 py-1.5 text-sm text-slate-900 dark:text-white outline-none"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                            Enter to save · Esc to cancel
                        </p>
                    </div>
                ) : (
                    <p className="text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed text-sm">
                        {message.content}
                    </p>
                )}
            </div>

            {/* Hover Actions */}
            {showActions && !isEditing && (
                <div className="absolute right-2 -top-3 flex items-center bg-white dark:bg-[#2a2a2e] border border-slate-200 dark:border-[#3a3a3e] rounded-lg shadow-md overflow-hidden z-10">
                    <button
                        title="Add Reaction"
                        className="p-1.5 text-slate-500 hover:text-yellow-500 hover:bg-slate-100 dark:hover:bg-[#3a3a3e] transition-colors"
                    >
                        <Smile size={15} />
                    </button>
                    <button
                        title="Reply"
                        onClick={() => onReply?.(message)}
                        className="p-1.5 text-slate-500 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-[#3a3a3e] transition-colors"
                    >
                        <Reply size={15} />
                    </button>
                    {isOwnMessage && (
                        <>
                            <button
                                title="Edit"
                                onClick={() => { setIsEditing(true); setShowActions(false); }}
                                className="p-1.5 text-slate-500 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-[#3a3a3e] transition-colors"
                            >
                                <Edit2 size={15} />
                            </button>
                            <button
                                title="Delete"
                                onClick={() => onDelete?.(message.id)}
                                className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-[#3a3a3e] transition-colors"
                            >
                                <Trash2 size={15} />
                            </button>
                        </>
                    )}
                    <button className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#3a3a3e] transition-colors">
                        <MoreVertical size={15} />
                    </button>
                </div>
            )}
        </div>
    );
}