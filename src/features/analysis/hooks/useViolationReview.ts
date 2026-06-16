import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExamViolations, resolveViolation, flagViolation } from '../api/attemptReviewApi';

export function useExamViolations(examId: string | null) {
  return useQuery({
    queryKey: ['examViolations', examId],
    queryFn: () => getExamViolations(examId!),
    enabled: !!examId,
    staleTime: 1000 * 30,
  });
}

export function useResolveViolation(examId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ attemptId, newScore = 0, notes = null }: {
    attemptId: number | string;
    newScore?: number;
    notes?: string | null;
    }) => resolveViolation(examId, attemptId, newScore, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['examViolations', examId] }),
  });
}

export function useFlagViolation(examId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (attemptId: number | string) => flagViolation(examId, attemptId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['examViolations', examId] }),
  });
}