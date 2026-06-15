import { useState } from "react";
import { Smile, MoreVertical, Reply, Edit2, Trash2 } from "lucide-react";
import type { MessageDto } from "../types/communityTypes";
import { useTranslation } from 'react-i18next';

interface MessageItemProps {
  message: MessageDto;
  isOwnMessage: boolean;
  currentUserAvatar?: string;
  onEdit?: (messageId: number, newContent: string) => void;
  onDelete?: (messageId: number) => void;
  onReply?: (message: MessageDto) => void;
  onOpenSettings?: () => void;
}

export default function MessageItem({
  message,
  isOwnMessage,
  currentUserAvatar,
  onEdit,
  onDelete,
  onReply,
  onOpenSettings,
}: MessageItemProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content ?? "");
  const [showActions, setShowActions] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const handleEditSubmit = () => {
    if (
      !editContent.trim() ||
      !message.content ||
      editContent === message.content
    ) {
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
            {t('community.deletedMessage')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex gap-4 hover:bg-slate-50 dark:hover:bg-[#1c1c1f] px-2 py-1 -mx-2 rounded-md transition-colors group relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowMore(false);
        setShowReactionPicker(false);
      }}
    >
      {/* Avatar */}
      <img
        src={
          message.senderAvatarUrl
            || (isOwnMessage ? currentUserAvatar : null)
            || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.senderName ?? "User")}&background=0D8ABC&color=fff`
        }
        alt={message.senderName ?? "User"}
        onError={(e) => {
          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(message.senderName ?? "User")}&background=0D8ABC&color=fff`;
        }}
        className="w-10 h-10 rounded-full mt-0.5 cursor-pointer hover:opacity-80 border border-slate-200 dark:border-slate-700 flex-shrink-0 object-cover"
      />

      <div className="flex-1 min-w-0">
        {/* Reply preview */}
        {message.replyPreview && (
          <div className="flex items-center gap-2 mb-1 text-xs text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">
            <div className="w-0.5 h-4 bg-slate-400 dark:bg-slate-500 rounded-full" />
            <span className="font-semibold">
              {message.replyPreview.senderName}
            </span>
            <span className="truncate max-w-xs">
              {message.replyPreview.contentPreview}
            </span>
          </div>
        )}

        {/* Name + timestamp */}
        <div className="flex items-baseline gap-2">
          <span
            className="font-semibold text-slate-900 dark:text-white hover:underline cursor-pointer"
            onClick={isOwnMessage ? onOpenSettings : undefined}
          >
            {message.senderName}
          </span>
          <span className="text-xs text-slate-400">
            {new Date(message.sentAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {message.editedAt && (
            <span className="text-[10px] text-slate-400 italic">{t('community.edited')}</span>
          )}
        </div>

        {/* Content or Edit Input */}
        {isEditing ? (
          <div className="mt-1">
            <input
              autoFocus
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEditSubmit();
                if (e.key === "Escape") setIsEditing(false);
              }}
              className="w-full bg-white dark:bg-[#2a2a2e] border border-blue-400 rounded-md px-3 py-1.5 text-sm text-slate-900 dark:text-white outline-none"
            />
            <p className="text-xs text-slate-400 mt-1">
              {t('community.enterToSave')}
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
        <div className="absolute right-2 -top-3 flex items-center bg-white dark:bg-[#2a2a2e] border border-slate-200 dark:border-[#3a3a3e] rounded-lg shadow-md z-10">
          <div className="relative">
            <button
              title={t('community.addReaction')}
              onClick={() => setShowReactionPicker((v) => !v)}
              className="p-1.5 text-slate-400 hover:text-yellow-500 hover:bg-slate-100 dark:hover:bg-[#3a3a3e] transition-colors"
            >
              <Smile size={15} />
            </button>
            {showReactionPicker && (
              <div
                className="absolute bottom-8 left-0 bg-white dark:bg-[#2a2a2e] border border-slate-200 dark:border-[#3a3a3e] rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1 z-30 w-44"
                onMouseLeave={(e) => e.stopPropagation()}
              >
                {[
                  "😀",
                  "😂",
                  "❤️",
                  "👍",
                  "🎉",
                  "🔥",
                  "😢",
                  "🙏",
                  "😎",
                  "👏",
                ].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      console.log(
                        "Reacted with",
                        emoji,
                        "on message",
                        message.id,
                      );
                      // TODO: call reaction API
                      setShowReactionPicker(false);
                      setShowActions(false);
                    }}
                    className="text-xl hover:bg-slate-100 dark:hover:bg-[#3a3a3e] rounded p-1 flex items-center justify-center"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            title={t('community.reply')}
            onClick={() => onReply?.(message)}
            className="p-1.5 text-slate-500 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-[#3a3a3e] transition-colors"
          >
            <Reply size={15} />
          </button>
          {isOwnMessage && (
            <>
              <button
                title={t('community.edit')}
                onClick={() => {
                  setIsEditing(true);
                  setShowActions(false);
                }}
                className="p-1.5 text-slate-500 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-[#3a3a3e] transition-colors"
              >
                <Edit2 size={15} />
              </button>
              <button
                title={t('community.delete')}
                onClick={() => onDelete?.(message.id)}
                className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-[#3a3a3e] transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
          <div className="relative">
            <button
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#3a3a3e] transition-colors"
              onClick={() => setShowMore((v) => !v)}
            >
              <MoreVertical size={15} />
            </button>
            {showMore && (
              <div
                className="absolute right-0 top-8 bg-white dark:bg-[#2a2a2e] border border-slate-200 dark:border-[#3a3a3e] rounded-lg shadow-lg z-30 py-1 w-36"
                onMouseLeave={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    onReply?.(message);
                    setShowMore(false);
                    setShowActions(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#3a3a3e]"
                >
                  {t('community.reply')}
                </button>
                {isOwnMessage && (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMore(false);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#3a3a3e]"
                    >
                      {t('community.edit')}
                    </button>
                    <button
                      onClick={() => {
                        onDelete?.(message.id);
                        setShowMore(false);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-slate-100 dark:hover:bg-[#3a3a3e]"
                    >
                      {t('community.delete')}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
