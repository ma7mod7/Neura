import {
  EllipsisVertical,
  Heart,
  MessageSquare,
  Pencil,
  Trash2,
  Send,
  X,
  ImageIcon,
  Reply,
  Edit2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  useLikePost,
  useDeletePost,
  useCreateComment,
  useDeleteComment,
  useUpdatePost,
  useUpdateComment,
  resolveImageUrl,
} from "../api";
import type { AnnouncementPost, AnnouncementComment } from "../api";

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

const CommentItem = ({ 
  comment, 
  postId, 
  onReplySuccess,
  userPhoto,
  isReply = false 
}: { 
  comment: AnnouncementComment; 
  postId: string;
  onReplySuccess: () => void;
  isReply?: boolean;
  userPhoto:string
  
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [text, setText] = useState(comment.content);
  const [replyText, setReplyText] = useState("");

  const cid = String(comment.id || comment.commentId);

  const { mutate: updateComment } = useUpdateComment(cid, postId);
  const { mutate: deleteComment } = useDeleteComment(postId);
  const { mutate: addReply, isPending: isSubmittingReply } = useCreateComment(postId);

  //const currentUserId = getCurrentUserId();
  //const isCommentOwner = !!currentUserId && comment.authorId === currentUserId; 

  const handleUpdate = () => {
    if (!text.trim()) return;
    updateComment({ content: text }, { onSuccess: () => setIsEditing(false) });
  };

  const handleReply = () => {
    if (!replyText.trim()) return;
    addReply({ content: replyText, parentCommentId: cid }, { 
      onSuccess: () => {
        setReplyText("");
        setIsReplying(false);
        onReplySuccess();
      } 
    });
  };


  return (
    <div className={`group mt-3 flex ${isReply ? 'gap-2' : 'gap-3'} animate-in fade-in slide-in-from-left-2`}>
      {/* تصغير صورة الرد */}
      <img 
        src={userPhoto} 
        className={`${isReply ? 'h-6 w-6 mt-1' : 'h-8 w-8'} rounded-full border border-slate-200 dark:border-slate-700`} 
        alt="avatar" 
      />
      
      <div className="flex-1">
        {/* تغيير شكل خلفية الرد ليكون أرق وأبسط */}
        <div className={`rounded-2xl ${isReply ? 'bg-transparent' : 'bg-slate-100 p-3 dark:bg-[#2a2a2e]'}`}>
          <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">{comment.createdByFullName || "User"}</p>
          
          {isEditing ? (
            <div className="flex gap-2 items-center mt-1">
              <input 
                value={text} 
                onChange={e => setText(e.target.value)} 
                className="flex-1 bg-white dark:bg-[#1c1c1f] text-sm p-1.5 rounded-lg outline-none border border-blue-500 text-slate-800 dark:text-white" 
              />
              <button onClick={handleUpdate} className="text-blue-600 font-bold text-xs">Save</button>
              <button onClick={() => setIsEditing(false)} className="text-red-500 text-xs">Cancel</button>
            </div>
          ) : (
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{comment.content}</p>
          )}
        </div>

        {/* أزرار التحكم */}
        <div className="flex gap-4 mt-1 ml-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
          <button onClick={() => setIsReplying(!isReplying)} className="hover:text-blue-500 flex items-center gap-1">
            <Reply size={12}/> Reply
          </button>
          <button onClick={() => setIsEditing(!isEditing)} className="hover:text-green-500 flex items-center gap-1">
            <Edit2 size={12}/> Edit
          </button>
          <button onClick={() => {
            if(window.confirm("Delete this comment?")) deleteComment(cid);
          }} className="hover:text-red-500 flex items-center gap-1">
            <Trash2 size={12}/> Delete
          </button>
        </div>

        {/* إدخال الرد */}
        {isReplying && (
          <div className="mt-3 flex gap-2 animate-in zoom-in-95">
            <input 
              value={replyText} 
              onChange={e => setReplyText(e.target.value)} 
              placeholder={`Reply to ${comment.authorName || "User"}...`}
              className="flex-1 bg-blue-50/50 dark:bg-[#0e0e10] dark:text-white text-xs p-2 rounded-xl outline-none border border-transparent focus:border-blue-500"
            />
            <button 
              disabled={isSubmittingReply || !replyText.trim()} 
              onClick={handleReply}
              className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              <Send size={14}/>
            </button>
          </div>
        )}

        {/* الردود المتداخلة */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {/* Toggle button */}
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors ml-1 mb-1"
            >
              {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showReplies
                ? 'Hide replies'
                : `View ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`
              }
            </button>

            {/* Replies list */}
            {showReplies && (
              <div className={`${isReply ? 'border-l border-slate-200 dark:border-[#3a3a3e] pl-3' : 'ml-2 border-l-2 border-slate-200 dark:border-[#3a3a3e] pl-4'} animate-in slide-in-from-top-2 duration-200`}>
                {comment.replies.map(reply => (
                  <CommentItem 
                    key={reply.id || reply.commentId} 
                    comment={reply} 
                    postId={postId} 
                    onReplySuccess={onReplySuccess} 
                    isReply={true} 
                    userPhoto={comment.createdByImageUrl}              
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
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

  const { mutate: likePost } = useLikePost(postId);
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();
  const { mutate: updatePost, isPending: isUpdating } = useUpdatePost(postId);
  const { mutate: createComment, isPending: isCommenting } =
    useCreateComment(postId);

  useEffect(() => {
    setIsLiked(post.isLikedByCurrentUser ?? post.isLiked ?? false);
    setLikesCount(post.likesCount ?? 0);
  }, [post.isLikedByCurrentUser, post.isLiked, post.likesCount]);

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
              src={post.createdByImageUrl}
              alt="Avatar"
              className="w-12 h-12 rounded-full border-2 border-blue-500 p-0.5"
            />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                {post.createdByFullName?? "Unknown"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                {createdAt ? new Date(createdAt).toLocaleString() : ""}
              </p>
            </div>
          </div>

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
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
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
          <button onClick={() => setShowComments(!showComments)} className="hover:text-blue-500 transition-colors">
            {post.commentsCount ?? post.comments?.length ?? 0} Comments
          </button>
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
                isLiked ? "text-red-500 fill-red-500" : "text-blue-600 dark:text-blue-400"
              }
            />
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-sm transition-colors"
          >
            <MessageSquare size={20} />
          </button>
        </div>

        {/* --- Comments Section --- */}
        {showComments && (
          <div className="mt-4 border-t border-slate-100 dark:border-[#2a2a2e] pt-4 space-y-3 animate-in slide-in-from-top-2">
            
            <div className="flex items-center gap-2 mb-4">
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

            <div className="space-y-4">
              {post.comments && post.comments.length > 0 ? (
                post.comments
                  .filter(c => !c.parentCommentId) 
                  .map((comment) => (
                    <CommentItem 
                      key={comment.id || comment.commentId} 
                      comment={comment} 
                      postId={postId} 
                      onReplySuccess={() => {}} 
                      userPhoto={comment.createdByImageUrl}              

                      
                    />
                ))
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- Edit Post Modal --- */}
      {isEditing && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsEditing(false)}
        >
          <div
            className="bg-white dark:bg-[#1c1c1f] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center bg-[#AFAFAF] dark:bg-[#2a2a2e] p-3 border-b border-slate-100 dark:border-[#3a3a3e]">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Announcement</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-[#3a3a3e] text-slate-500 dark:text-slate-300 transition-colors bg-[#E4E4E4] dark:bg-[#3a3a3e]"
              >
                <X size={20} />
              </button>
            </div>
      
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
                <button
                  onClick={() => editImageRef.current?.click()}
                  className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors border border-dashed border-slate-300 dark:border-[#3a3a3e] rounded-xl p-3 w-fit"
                >
                  <ImageIcon size={18} />
                  <span>Add Image</span>
                </button>
              )}
      
              <input
                type="file"
                accept="image/*"
                hidden
                ref={editImageRef}
                onChange={handleEditImageChange}
              />
      
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