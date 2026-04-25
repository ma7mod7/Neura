import {
  EllipsisVertical,
  Heart,
  MessageSquare,
  Pencil,
  Trash2,
  Send,
  X,
  ImageIcon,
} from "lucide-react";
import Course from "../../../assets/course.png";
import { useEffect, useRef, useState } from "react";
import {
  useLikePost,
  useDeletePost,
  useCreateComment,
  useDeleteComment,
  useUpdatePost,
  resolveImageUrl,
} from "../api";
import type { AnnouncementPost } from "../api";

interface Props {
  post: AnnouncementPost;
}

// Get current user id
const getCurrentUserId = (): string => {
  try {
    const user = JSON.parse(localStorage.getItem("user") ?? "{}");
    return user?.id ?? "";
  } catch {
    return "";
  }
};

const AnnouncementCard = ({ post }: Props) => {
  const currentUserId = getCurrentUserId();
  const isOwner = !!currentUserId && post.createdById === currentUserId;

  const [isOpenPostCardSetting, setIsOpenPostCardSetting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editTitle, setEditTitle] = useState(post.title ?? "");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(
    resolveImageUrl(post.imageUrl),
  );
  const editImageRef = useRef<HTMLInputElement>(null);

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImage(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveEditImage = () => {
    setEditImage(null);
    setEditImagePreview(null);
    if (editImageRef.current) editImageRef.current.value = "";
  };

  const [isLiked, setIsLiked] = useState(
    post.isLikedByCurrentUser ?? post.isLiked ?? false,
  );
  const [likesCount, setLikesCount] = useState(post.likesCount ?? 0);

  const imageUrl = resolveImageUrl(post.imageUrl);
  const createdAt = post.createdOn ?? post.createdAt;

  const PostCardSettingRef = useRef<HTMLDivElement>(null);
  const postId = String(post.id);

  // ── Hooks ──────────────────────────────────────────────────
  const { mutate: likePost } = useLikePost(postId);
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();
  const { mutate: updatePost, isPending: isUpdating } = useUpdatePost(postId);
  const { mutate: createComment, isPending: isCommenting } =
    useCreateComment(postId);
  const { mutate: deleteComment } = useDeleteComment(postId);

  useEffect(() => {
    setIsLiked(post.isLikedByCurrentUser ?? post.isLiked ?? false);
    setLikesCount(post.likesCount ?? 0);
  }, [post.isLikedByCurrentUser, post.isLiked, post.likesCount]);

  // ── Handlers ───────────────────────────────────────────────
  const handleLike = () => {
    setIsLiked((prev) => !prev);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    likePost();
  };

  const handleDeletePost = () => {
    deletePost(postId);
    setIsOpenPostCardSetting(false);
  };

const handleSaveEdit = () => {
  if (!editContent.trim()) return;
  updatePost(
    {
      content: editContent,
      title:   editTitle || undefined,
      image:   editImage ?? undefined, 
    },
    { onSuccess: () => setIsEditing(false) }
  );
};
  const handleAddComment = () => {
    if (!commentText.trim()) return;
    createComment(
      { content: commentText },
      { onSuccess: () => setCommentText("") },
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        PostCardSettingRef.current &&
        !PostCardSettingRef.current.contains(event.target as Node)
      ) {
        setIsOpenPostCardSetting(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      <div className="bg-white dark:bg-[#1c1c1f] rounded-xl p-6 shadow-sm mb-6 border border-slate-200 dark:border-[#2a2a2e] relative">
        {/* --- Header --- */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={post.authorAvatar ?? Course}
              alt="Avatar"
              className="w-12 h-12 rounded-full border-2 border-blue-500 p-0.5"
            />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                {post.authorName ?? "Unknown"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                {createdAt ? new Date(createdAt).toLocaleString() : ""}
              </p>
            </div>
          </div>

          {/* Action Menu — only show for post owner */}
          {isOwner && (
            <div className="relative" ref={PostCardSettingRef}>
              <button
                onClick={() => setIsOpenPostCardSetting(!isOpenPostCardSetting)}
                className={`transition-all rounded-full p-1.5 ${
                  isOpenPostCardSetting
                    ? "bg-slate-100 dark:bg-[#2a2a2e] text-slate-900 dark:text-white"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#2a2a2e]"
                }`}
              >
                <EllipsisVertical size={20} />
              </button>

              {isOpenPostCardSetting && (
                <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-[#2a2a2e] rounded-xl shadow-xl border border-slate-100 dark:border-[#3a3a3e] overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-col py-1">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setIsOpenPostCardSetting(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#3a3a3e] hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-colors"
                    >
                      <Pencil size={14} />
                      <span>Edit</span>
                    </button>
                    <div className="h-px bg-slate-100 dark:bg-[#3a3a3e] mx-2 my-0.5" />
                    <button
                      onClick={handleDeletePost}
                      disabled={isDeleting}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- Title --- */}
        {post.title && (
          <h2 className="font-bold text-slate-900 dark:text-white text-base mb-1">
            {post.title}
          </h2>
        )}

        {/* --- Content --- */}
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
          {post.content}
        </p>

        {/* --- Image relative URL --- */}
        {imageUrl && (
          <div className="rounded-2xl overflow-hidden mb-4 border border-slate-100 dark:border-[#2a2a2e] bg-slate-50 dark:bg-[#0e0e10] flex justify-center p-4">
            <img
              src={imageUrl}
              alt="Announcement"
              className="max-h-64 object-contain"
            />
          </div>
        )}

        {/* --- Stats --- */}
        <div className="pt-4 border-t border-slate-100 dark:border-[#2a2a2e]" />
        <div className="flex items-center justify-between gap-4 text-slate-500 dark:text-slate-400 text-xs font-medium mt-2">
          <span>{likesCount} Likes</span>
          <span>
            {post.commentsCount ?? post.comments?.length ?? 0} Comments
          </span>
        </div>

        {/* --- Actions --- */}
        <div className="flex items-center gap-6 mt-4 pt-2 justify-between">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 font-semibold text-sm transition-colors"
          >
            <Heart
              size={20}
              className={
                isLiked ? "text-red-500 fill-red-500" : "text-blue-600"
              }
            />
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-semibold text-sm transition-colors"
          >
            <MessageSquare size={20} />
          </button>
        </div>

        {/* --- Comments Section --- */}
        {showComments && (
          <div className="mt-4 border-t border-slate-100 dark:border-[#2a2a2e] pt-4 space-y-3">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div
                  key={comment.commentId}
                  className="flex items-start gap-3 group"
                >
                  <img
                    src={comment.authorAvatar ?? Course}
                    alt="avatar"
                    className="w-8 h-8 rounded-full border border-blue-400"
                  />
                  <div className="flex-1 bg-slate-50 dark:bg-[#0e0e10] rounded-xl px-3 py-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-white mb-0.5">
                      {comment.authorName ?? "Unknown"}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {comment.content}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteComment(comment.commentId)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
                No comments yet.
              </p>
            )}

            <div className="flex items-center gap-2 mt-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                placeholder="Write a comment..."
                className="flex-1 bg-slate-50 dark:bg-[#0e0e10] dark:text-white dark:placeholder:text-slate-500 rounded-xl px-4 py-2 text-sm outline-none border border-slate-200 dark:border-[#2a2a2e] focus:ring-2 ring-blue-500"
              />
              <button
                onClick={handleAddComment}
                disabled={isCommenting || !commentText.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition-colors disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- Edit Modal --- */}

      {isEditing && (
  <div
    className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={() => setIsEditing(false)}
  >
    <div
      className="bg-white dark:bg-[#1c1c1f] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex justify-between items-center bg-[#AFAFAF] dark:bg-[#2a2a2e] p-3 border-b border-slate-100 dark:border-[#3a3a3e]">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Announcement</h2>
        <button
          onClick={() => setIsEditing(false)}
          className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-[#3a3a3e] text-slate-500 dark:text-slate-300 transition-colors bg-[#E4E4E4] dark:bg-[#3a3a3e]"
        >
          <X size={20} />
        </button>
      </div>
 
      {/* Body */}
      <div className="p-4 overflow-y-auto flex flex-col gap-3">
        <input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full bg-blue-50/50 dark:bg-[#0e0e10] dark:text-white dark:placeholder:text-slate-500 rounded-xl p-4 text-slate-700 outline-none text-sm border border-transparent focus:ring-2 ring-blue-500"
          placeholder="Title (optional)"
        />
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full h-32 bg-blue-50/50 dark:bg-[#0e0e10] dark:text-white dark:placeholder:text-slate-500 rounded-xl p-4 text-slate-700 outline-none resize-none text-base"
          placeholder="Write here..."
        />
 
        {/* Image preview */}
        {editImagePreview ? (
          <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-[#3a3a3e] bg-slate-50 dark:bg-[#0e0e10]">
            <button
              onClick={handleRemoveEditImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors z-10 shadow-sm"
            >
              <Trash2 size={16} />
            </button>
            <img src={editImagePreview} alt="Preview" className="w-full h-48 object-contain" />
          </div>
        ) : (
          // No image — show upload button area
          <button
            onClick={() => editImageRef.current?.click()}
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors border border-dashed border-slate-300 dark:border-[#3a3a3e] rounded-xl p-3 w-fit"
          >
            <ImageIcon size={18} />
            <span>Add Image</span>
          </button>
        )}
 
        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          hidden
          ref={editImageRef}
          onChange={handleEditImageChange}
        />
 
        {/* Replace image button (shown when image exists) */}
        {editImagePreview && (
          <button
            onClick={() => editImageRef.current?.click()}
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors w-fit"
          >
            <ImageIcon size={16} />
            <span>Replace image</span>
          </button>
        )}
      </div>
 
      {/* Footer */}
      <div className="px-4 pb-4">
        <button
          onClick={handleSaveEdit}
          disabled={isUpdating || !editContent.trim()}
          className="w-full bg-[#0061EF] text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-50"
        >
          {isUpdating ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
};

export default AnnouncementCard;
