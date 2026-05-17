import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../shared/api/axiosInstance";
import { announcementKeys } from "./queryKeys";
import type { AnnouncementComment, CreateCommentDto, UpdateCommentDto } from "./types";
import toast from "react-hot-toast";

// ── API calls ────────────────────────────────────────────────

const createCommentApi = async (
  postId: string,
  dto: CreateCommentDto
): Promise<AnnouncementComment> => {
  const formData = new FormData();
  formData.append("Content", dto.content);
  
  if (dto.parentCommentId) {
    formData.append("ParentCommentId", dto.parentCommentId);
  }

  const { data } = await axiosInstance.post(
    `/api/announcements/posts/${postId}/comments`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return data;
};

const updateCommentApi = async (
  commentId: string,
  dto: UpdateCommentDto
): Promise<AnnouncementComment> => {
  // ⭐ تم تحويل البيانات لـ JSON لحل خطأ 415 (Unsupported Media Type)
  const { data } = await axiosInstance.put(
    `/api/announcements/comments/${commentId}`,
    { content: dto.content },
    { headers: { "Content-Type": "application/json" } }
  );
  return data;
};

const deleteCommentApi = async (commentId: string): Promise<void> => {
  await axiosInstance.delete(`/api/announcements/comments/${commentId}`);
};

const updateCommentImageApi = async (commentId: string, image: File): Promise<void> => {
  const formData = new FormData();
  const ext = image.name.split('.').pop() ?? 'jpg';
  const safeFile = new File([image], `image.${ext}`, { type: image.type });
  formData.append("Image", safeFile);
  await axiosInstance.put(`/api/announcements/comments/${commentId}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ── Hooks ─────────────────────────────────────────────────────

export const useCreateComment = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCommentDto) => createCommentApi(postId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.comments(postId) });
      queryClient.invalidateQueries({ queryKey: announcementKeys.posts() });
    },
    onError: (error) => {
      console.error("Failed to create comment", error);
      toast.error("Failed to post comment.");
    },
  });
};

export const useUpdateComment = (commentId: string, postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateCommentDto) => updateCommentApi(commentId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.comments(postId) });
      queryClient.invalidateQueries({ queryKey: announcementKeys.posts() });
      toast.success("Comment updated.");
    },
    onError: (error) => {
      console.error("Failed to update comment", error);
      toast.error("Failed to update comment.");
    },
  });
};

export const useDeleteComment = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteCommentApi(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.comments(postId) });
      queryClient.invalidateQueries({ queryKey: announcementKeys.posts() });
      toast.success("Comment deleted.");
    },
    onError: (error) => {
      console.error("Failed to delete comment", error);
      toast.error("Failed to delete comment.");
    },
  });
};

export const useUpdateCommentImage = (commentId: string, postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (image: File) => updateCommentImageApi(commentId, image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.comments(postId) });
    },
    onError: (error) => {
      console.error("Failed to update comment image", error);
    },
  });
};