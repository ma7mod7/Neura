import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyApplicationStatus, submitApplication, updateApplication,
  getApplications, getApplicationById, approveApplication, rejectApplication,
} from '../api/instructorApplicationApi';
import type { ApplicationsListParams } from '../types/instructorApplication.types';
import { useAuth } from '../../auth/hooks/useAuth'; 
import { getTokenRoles } from '../../../utils/jwt'; 

export function useMyApplicationStatus() {
  const { refreshUser, token } = useAuth();
  const isAlreadyInstructor = getTokenRoles(token).some(
    (r) => r.toLowerCase() === 'instructor'
  );

  return useQuery({
    queryKey: ['instructorApplication', 'me'],
    queryFn: async () => {
      const data = await getMyApplicationStatus();
      if (data.isInstructor && !isAlreadyInstructor) {
        await refreshUser();
      }
      return data;
    },
    staleTime: 1000 * 60,
  });
}

export function useSubmitApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitApplication,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['instructorApplication'] }),
  });
}

export function useUpdateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateApplication,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['instructorApplication'] }),
  });
}

export function useApplicationsList(params: ApplicationsListParams = {}) {
  return useQuery({
    queryKey: ['instructorApplications', 'list', params],
    queryFn: () => getApplications(params),
    staleTime: 1000 * 30,
  });
}

export function useApplicationDetail(id: number | null) {
  return useQuery({
    queryKey: ['instructorApplications', 'detail', id],
    queryFn: () => getApplicationById(id!),
    enabled: id != null,
  });
}

export function useApproveApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => approveApplication(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['instructorApplications'] }),
  });
}

export function useRejectApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => rejectApplication(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['instructorApplications'] }),
  });
}