import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPendingReviewExams,
  getReviewHistory,
  getExamReviewStats,
  getExamReviewDetail,
  submitExamForReview,
  approveExam,
  rejectExam,
} from '../api/examReviewApi';

export function usePendingReviewExams() {
  return useQuery({
    queryKey: ['examReview', 'pending'],
    queryFn: getPendingReviewExams,
    staleTime: 1000 * 30,
  });
}

export function useReviewHistory() {
  return useQuery({
    queryKey: ['examReview', 'history'],
    queryFn: getReviewHistory,
    staleTime: 1000 * 60,
  });
}

export function useExamReviewStats() {
  return useQuery({
    queryKey: ['examReview', 'stats'],
    queryFn: getExamReviewStats,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useExamReviewDetail(examId: number | string | null) {
  return useQuery({
    queryKey: ['examReview', 'detail', examId],
    queryFn: () => getExamReviewDetail(examId!),
    enabled: examId != null,
  });
}

export function useSubmitForReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (examId: number | string) => submitExamForReview(examId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['examReview'] });
      qc.invalidateQueries({ queryKey: ['editableCourses'] });
      qc.invalidateQueries({ queryKey: ['courseContent'] });
    },
  });
}

export function useApproveExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (examId: number | string) => approveExam(examId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['examReview'] });
      qc.invalidateQueries({ queryKey: ['courseContent'] });
    },
  });
}

export function useRejectExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, reason }: { examId: number | string; reason: string }) =>
      rejectExam(examId, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['examReview'] }),
  });
}