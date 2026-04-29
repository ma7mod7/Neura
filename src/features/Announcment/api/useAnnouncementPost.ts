import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../shared/api/axiosInstance";
import { announcementKeys } from "./queryKeys";
import toast from "react-hot-toast"; 
import type {
  AnnouncementPost,
  CreatePostDto,
  UpdatePostDto,
} from "./types";

const BASE_URL = "http://neura.runasp.net/";

// ── API calls ────────────────────────────────────────────────

// ⭐ تم تعديل الدالة لتقبل pageParam وتمرره كـ Query Parameter للباك إند
const getAllPostsApi = async (pageParam: number) => {
  const { data } = await axiosInstance.get("/api/announcements/posts", { 
    params: { 
      PageNumber: pageParam,
      PageSize: 10 // يمكنك تعديل العدد كما يناسبك
    } 
  });
  console.log(data)
  return data;
};

const getPostByIdApi = async (postId: string): Promise<AnnouncementPost> => {
  const { data } = await axiosInstance.get(`/api/announcements/posts/${postId}`);
  return data;
};

const createPostApi = async (dto: CreatePostDto): Promise<AnnouncementPost> => {
  const formData = new FormData();
  if (dto.Title) formData.append("Title", dto.Title);
  formData.append("Content", dto.Content);
  formData.append("IsPublic", "true");
  
  if (dto.Image) {
    const ext = dto.Image.name.split('.').pop() ?? 'jpg';
    const safeFile = new File([dto.Image], `image.${ext}`, { type: dto.Image.type });
    formData.append("Image", safeFile);
  }

  const { data } = await axiosInstance.post("/api/announcements/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

const updatePostApi = async (postId: string, dto: UpdatePostDto): Promise<AnnouncementPost> => {
  const body: Record<string, string> = { content: dto.content };
  if (dto.title) body.title = dto.title;
 
  const { data: updatedPost } = await axiosInstance.put(
    `/api/announcements/posts/${postId}`,
    body,
    { headers: { "Content-Type": "application/json" } }
  );
  return updatedPost;
};

const deletePostApi = async (postId: string): Promise<void> => {
  await axiosInstance.delete(`/api/announcements/posts/${postId}`);
};

const likePostApi = async (postId: string): Promise<void> => {
  await axiosInstance.post(`/api/announcements/posts/${postId}/likes`);
};

export const resolveImageUrl = (imageUrl?: string): string | null => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${BASE_URL}${imageUrl}`;
};

// ── Hooks ─────────────────────────────────────────────────────

// ⭐ تم تحويل الهوك ليستخدم useInfiniteQuery
export const useGetAllPosts = () => {
  return useInfiniteQuery({
    queryKey: announcementKeys.posts(),
    initialPageParam: 1, // الصفحة الأولى
    queryFn: ({ pageParam }) => getAllPostsApi(pageParam),
    getNextPageParam: (lastPage, allPages) => {
      // إذا كان الباك إند يعيد hasNextPage بشكل صريح
      if (lastPage?.hasNextPage) {
        return lastPage.pageNumber + 1;
      }
      
      // كبديل: استخراج البيانات والتحقق من العدد
      const items = Array.isArray(lastPage) ? lastPage : (lastPage?.items || lastPage?.data || []);
      // إذا رجع 10 بوستات (حجم الصفحة)، معناها إن فيه احتمالية لصفحة تانية
      return items.length === 10 ? allPages.length + 1 : undefined;
    },
  });
};

export const useGetPostById = (postId: string) => {
  return useQuery({
    queryKey: announcementKeys.post(postId),
    queryFn: () => getPostByIdApi(postId),
    enabled: !!postId,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePostDto) => createPostApi(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.posts() });
      toast.success("Post published successfully!"); 
    },
    onError: (error) => {
      console.error("Failed to create post", error);
      toast.error("Failed to publish post. Please try again.");
    }
  });
};

export const useUpdatePost = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdatePostDto) => updatePostApi(postId, dto),
    onSuccess: () => {
      // في الـ Infinite Query يفضل عمل Invalidate بالكامل لضمان ترتيب الداتا
      queryClient.invalidateQueries({ queryKey: announcementKeys.posts() });
      toast.success("Post updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update post.");
    }
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => deletePostApi(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.posts() });
      toast.success("Post deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete post.");
    }
  });
};

export const useLikePost = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => likePostApi(postId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.posts() });
    },
  });
};