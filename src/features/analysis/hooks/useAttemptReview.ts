import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPendingAttemptReviews,
  getAttemptReviewHistory,
  getAttemptReviewStats,
  getAttemptReviewDetail,
  resolveViolation,
  flagViolation,
} from '../api/attemptReviewApi';
import axiosInstance from '../../../shared/api/axiosInstance';
import type { AttemptReviewStatus } from '../types/analysis.types';

export function usePendingAttemptReviews() {
  return useQuery({
    queryKey: ['attemptReview', 'pending'],
    queryFn: getPendingAttemptReviews,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useAttemptReviewHistory() {
  return useQuery({
    queryKey: ['attemptReview', 'history'],
    queryFn: getAttemptReviewHistory,
    staleTime: 1000 * 60,
    retry: false,
  });
}

export function useAttemptReviewStats() {
  return useQuery({
    queryKey: ['attemptReview', 'stats'],
    queryFn: getAttemptReviewStats,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useAttemptReviewDetail(attemptId: number | string | null) {
  return useQuery({
    queryKey: ['attemptReview', 'detail', attemptId],
    queryFn: () => getAttemptReviewDetail(attemptId!),
    enabled: attemptId != null,
  });
}

// Resolve = pass the attempt as-is (no cheating confirmed)
export function useResolveViolation(lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ attemptId, newScore }: { attemptId: number | string; newScore?: number }) => {
      const examRes = await axiosInstance.get(`/api/Exams/by-lesson/${lessonId}`);
      const internalId = examRes.data?.id ?? examRes.data?.examId;
      return resolveViolation(internalId, attemptId, newScore ?? 0, null);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['examViolations', lessonId] });
      qc.invalidateQueries({ queryKey: ['examAttempts'] });
      qc.invalidateQueries({ queryKey: ['studentAttempts'] });
    },
  });
}

// Flag = confirm cheating, force fail
export function useFlagViolation(lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (attemptId: number | string) => {
      const examRes = await axiosInstance.get(`/api/Exams/by-lesson/${lessonId}`);
      const internalId = examRes.data?.id ?? examRes.data?.examId;
      return flagViolation(internalId, attemptId, null);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['examViolations', lessonId] });
      qc.invalidateQueries({ queryKey: ['examAttempts'] });
      qc.invalidateQueries({ queryKey: ['studentAttempts'] });
    },
  });
}

export function useApproveAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, attemptId }: { examId: string; attemptId: number | string }) =>
      resolveViolation(examId, attemptId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['examViolations'] });
      qc.invalidateQueries({ queryKey: ['examAttempts'] });
    },
  });
}

export function useRejectAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, attemptId }: { examId: string; attemptId: number | string; reason?: string }) =>
      flagViolation(examId, attemptId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['examViolations'] });
      qc.invalidateQueries({ queryKey: ['examAttempts'] });
    },
  });
}

// Polls every 10s while the attempt is still under review
export function useMyAttemptReviewStatus(attemptId: number | string | null) {
  return useQuery({
    queryKey: ['attemptReview', 'myStatus', attemptId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/ExamAttempts/${attemptId}/results`);
      const data = res.data;
      const isResolved =
        data.areGradesPublished === true &&
        data.passed !== null &&
        data.passed !== undefined;
      const status: AttemptReviewStatus = isResolved
        ? data.passed ? 'Approved' : 'Rejected'
        : 'UnderReview';
      return { status, reviewedAt: data.submittedAt ?? null };
    },
    enabled: attemptId != null,
    refetchInterval: (query) =>
      query.state.data?.status === 'UnderReview' ? 10_000 : false,
    staleTime: 0,
  });
}

// Violations per exam
export function useExamViolations(lessonId: string | null) {
  return useQuery({
    queryKey: ['examViolations', lessonId],
    queryFn: async () => {
      try {
        const examRes = await axiosInstance.get(`/api/Exams/by-lesson/${lessonId}`);
        const internalId = examRes.data?.id ?? examRes.data?.examId;
        if (!internalId) return [];
        const res = await axiosInstance.get(`/api/exams/${internalId}/analytics/violations`);
        return Array.isArray(res.data) ? res.data : res.data?.violations ?? [];
      } catch {
        return [];
      }
    },
    enabled: !!lessonId,
    staleTime: 1000 * 30,
    retry: false,
  });
}