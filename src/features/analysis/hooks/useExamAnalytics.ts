import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getExamAnalytics,
  getExamAttempts,
  getScoreDistribution,
  getAttemptResults,
  getStudentExamAnalytics, 
  getStudentScoreDistribution,
  getStudentAttempts,
  publishExamGrades
} from '../api/analysisApi';

export function useExamAnalytics(examId: string | null) {
  return useQuery({
    queryKey: ['examAnalytics', examId],
    queryFn: () => getExamAnalytics(examId!),
    enabled: !!examId,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useStudentExamAnalytics(examId: string | null) {
  return useQuery({
    queryKey: ['studentExamAnalytics', examId],
    queryFn: () => getStudentExamAnalytics(examId!),
    enabled: !!examId,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useStudentScoreDistribution(examId: string | null) {
  return useQuery({
    queryKey: ['studentScoreDistribution', examId],
    queryFn: () => getStudentScoreDistribution(examId!),
    enabled: !!examId,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useStudentAttempts(examId: string | null) {
  return useQuery({
    queryKey: ['studentAttempts', examId],
    queryFn: () => getStudentAttempts(examId!),
    enabled: !!examId,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useExamAttempts(examId: string | null) {
  return useQuery({
    queryKey: ['examAttempts', examId],
    queryFn: () => getExamAttempts(examId!),
    enabled: !!examId,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useScoreDistribution(examId: string | null) {
  return useQuery({
    queryKey: ['scoreDistribution', examId],
    queryFn: async () => {
      try {
        return await getScoreDistribution(examId!);
      } catch (err: any) {
        if (err?.response?.status === 404) return { buckets: [] };
        throw err;
      }
    },
    enabled: !!examId,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useAttemptResults(attemptId: string | null) {
  return useQuery({
    queryKey: ['attemptResults', attemptId],
    queryFn: () => getAttemptResults(attemptId!),
    enabled: !!attemptId,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}

export function usePublishGrades(examId: string | null) {
  const qc = useQueryClient();
  const storageKey = `grades_published_${examId}`;

  return useMutation({
    mutationFn: () => publishExamGrades(examId!),
    onSuccess: (data) => {
      console.log(data)
      // Mark as published in localStorage so refresh keeps the state
      localStorage.setItem(storageKey, 'true');
      qc.invalidateQueries({ queryKey: ['examAnalytics', examId] });
      qc.invalidateQueries({ queryKey: ['examAttempts', examId] });
      qc.invalidateQueries({ queryKey: ['examViolations', examId] });
    },
  });
}