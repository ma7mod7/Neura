import { useQuery } from '@tanstack/react-query';
import {
  getExamAnalytics,
  getExamAttempts,
  getScoreDistribution,
  getAttemptResults,
} from '../api/analysisApi';

export function useExamAnalytics(examId: string | null) {
  return useQuery({
    queryKey: ['examAnalytics', examId],
    queryFn: () => getExamAnalytics(examId!),
    enabled: !!examId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useExamAttempts(examId: string | null) {
  return useQuery({
    queryKey: ['examAttempts', examId],
    queryFn: () => getExamAttempts(examId!),
    enabled: !!examId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
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
