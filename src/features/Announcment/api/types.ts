export interface AnnouncementPost {
  id: number;
  title?: string;
  content: string;
  imageUrl?: string;         
  isPublic?: boolean;
  courseId?: number | null;
  sectionId?: number | null;
  createdById?: string;    
  updatedById?: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  likesCount?: number;
  commentsCount?: number;
  isLikedByCurrentUser?: boolean;  
  isLiked?: boolean;            
  createdAt?: string;
  createdOn?: string;      
  updatedAt?: string;
  updatedOn?: string;
  comments?: AnnouncementComment[];
}

export interface CreatePostDto {
  Title?: string;
  Content: string;
  Image?: File;
}

export interface UpdatePostDto {
  title?: string;
  content: string;
  image?: File;
}

export interface UpdatePostVisibilityDto {
  IsPublic: boolean;
}

// ── Comment ─────────────────────────────────────────────────

export interface AnnouncementComment {
  id?: string | number; // ⭐ تم إضافة id كبديل محتمل
  commentId?: string;   // جعلناها اختيارية
  postId: string;
  content: string;
  imageUrl?: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt?: string;
  parentCommentId?: string | null; 
  replies?: AnnouncementComment[]; 
}

export interface CreateCommentDto {
  content: string;
  parentCommentId?: string; 
}

export interface UpdateCommentDto {
  content: string;
}

// ── Course & Section ─────────────────────────────────────────

export interface Course {
  id?: number;
  keyId: string;
  title: string;
  imageUrl?: string;
  instructorName?: string;
}

export interface Section {
  id: number;
  title: string;
  position: number;
}

// ── Shared ──────────────────────────────────────────────────

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}