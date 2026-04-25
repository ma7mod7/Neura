import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../shared/api/axiosInstance";
import { announcementKeys } from "./queryKeys";
import type {
  AnnouncementPost,
  CreatePostDto,
  UpdatePostDto,
  UpdatePostVisibilityDto,
  PaginationParams,
} from "./types";

const BASE_URL = "http://neura.runasp.net/";

// ── API calls ────────────────────────────────────────────────

const getAllPostsApi = async (params?: PaginationParams): Promise<AnnouncementPost[]> => {
  const { data } = await axiosInstance.get("/api/announcements/posts", { params });
  if (Array.isArray(data))        return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data))  return data.data;
  return [];
};

const getPostByIdApi = async (postId: string): Promise<AnnouncementPost> => {
  const { data } = await axiosInstance.get(`/api/announcements/posts/${postId}`);
  return data;
};

const createPostApi = async (dto: CreatePostDto): Promise<AnnouncementPost> => {
  const formData = new FormData();
  if (dto.Title)                   formData.append("Title", dto.Title);
  formData.append("Content", dto.Content);
  if (dto.IsPublic  !== undefined) formData.append("IsPublic",  String(dto.IsPublic));
  if (dto.CourseId  !== undefined) formData.append("CourseId",  String(dto.CourseId));
  if (dto.SectionId !== undefined) formData.append("SectionId", String(dto.SectionId));
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
  console.log("Update post response:", updatedPost);

  if (dto.image) {
    const formData = new FormData();
    const ext      = dto.image.name.split('.').pop() ?? 'jpg';
    const safeFile = new File([dto.image], `image.${ext}`, { type: dto.image.type });
    formData.append("Image", safeFile);
    await axiosInstance.put(
      `/api/announcements/posts/${postId}/image`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    const { data: freshPost } = await axiosInstance.get(
      `/api/announcements/posts/${postId}`
    );
    console.log("post after image upload:", freshPost);
    return freshPost;
  }
 
  return updatedPost;
};
 

const deletePostApi = async (postId: string): Promise<void> => {
  await axiosInstance.delete(`/api/announcements/posts/${postId}`);
};

const updatePostVisibilityApi = async (postId: string, dto: UpdatePostVisibilityDto): Promise<void> => {
  const formData = new FormData();
  formData.append("IsPublic", String(dto.IsPublic));
  await axiosInstance.put(`/api/announcements/posts/${postId}/visibility`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const updatePostImageApi = async (postId: string, image: File): Promise<void> => {
  const formData = new FormData();
  const ext = image.name.split('.').pop() ?? 'jpg';
  const safeFile = new File([image], `image.${ext}`, { type: image.type });
  formData.append("Image", safeFile);
  await axiosInstance.put(`/api/announcements/posts/${postId}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const likePostApi = async (postId: string): Promise<void> => {
  await axiosInstance.post(`/api/announcements/posts/${postId}/likes`);
};

// ── Helpers ───────────────────────────────────────────────────

export const resolveImageUrl = (imageUrl?: string): string | null => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${BASE_URL}${imageUrl}`;
};

// ── Hooks ─────────────────────────────────────────────────────

export const useGetAllPosts = (params?: PaginationParams) => {
  return useQuery({
    queryKey: announcementKeys.posts(),
    queryFn: () => getAllPostsApi(params),
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
    },
    onError: (error) => {
      console.error("Failed to create post", error);
    },
  });
};

export const useUpdatePost = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdatePostDto) => updatePostApi(postId, dto),
 
    onSuccess: (updatedPost) => {
      // Directly update the post in the list cache 
      queryClient.setQueryData<AnnouncementPost[]>(
        announcementKeys.posts(),
        (old = []) =>
          old.map((p) => (String(p.id) === postId ? updatedPost : p))
      );
    },
 
    onError: (error) => {
      console.error("Failed to update post", error);
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => deletePostApi(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.posts() });
    },
    onError: (error) => {
      console.error("Failed to delete post", error);
    },
  });
};

export const useUpdatePostVisibility = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdatePostVisibilityDto) => updatePostVisibilityApi(postId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: announcementKeys.posts() });
    },
    onError: (error) => {
      console.error("Failed to update post visibility", error);
    },
  });
};

export const useUpdatePostImage = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (image: File) => updatePostImageApi(postId, image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: announcementKeys.posts() });
    },
    onError: (error) => {
      console.error("Failed to update post image", error);
    },
  });
};

export const useLikePost = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => likePostApi(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: announcementKeys.posts() });
      const previous = queryClient.getQueryData<AnnouncementPost[]>(announcementKeys.posts());
      queryClient.setQueryData<AnnouncementPost[]>(announcementKeys.posts(), (old = []) =>
        old.map((p) =>
          String(p.id) === postId
            ? {
                ...p,
                isLikedByCurrentUser: !p.isLikedByCurrentUser,
                likesCount: (p.likesCount ?? 0) + (p.isLikedByCurrentUser ? -1 : 1),
              }
            : p
        )
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(announcementKeys.posts(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.posts() });
    },
  });
};