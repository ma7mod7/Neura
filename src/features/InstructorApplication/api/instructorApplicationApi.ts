import axiosInstance from '../../../shared/api/axiosInstance';
import type {
  InstructorApplication, MyApplicationStatus,
  ApplicationsListParams, ApplicationsListResponse,
} from '../types/instructorApplication.types';
import type { InstructorApplicationFormValues } from '../schema/instructorApplication.schema';

export const getMyApplicationStatus = async (): Promise<MyApplicationStatus> => {
  const res = await axiosInstance.get('/api/instructor/application');
  return res.data;
};

export const submitApplication = async (data: InstructorApplicationFormValues): Promise<InstructorApplication> => {
  const res = await axiosInstance.post('/api/instructor/apply', data);
  return res.data;
};

export const updateApplication = async (data: InstructorApplicationFormValues): Promise<InstructorApplication> => {
  const res = await axiosInstance.put('/api/instructor/application', data);
  return res.data;
};

// Admin 
export const getApplications = async (params: ApplicationsListParams = {}): Promise<ApplicationsListResponse> => {
  const res = await axiosInstance.get('/api/instructor/applications', { params });
  const data = res.data;
  if (Array.isArray(data)) {
    return { items: data, totalCount: data.length, page: params.page ?? 1, pageSize: params.pageSize ?? 10 };
  }
  return data;
};

export const getApplicationById = async (id: number): Promise<InstructorApplication> => {
  const res = await axiosInstance.get(`/api/instructor/applications/${id}`);
  return res.data;
};

export const approveApplication = async (id: number): Promise<InstructorApplication> => {
  const res = await axiosInstance.post(`/api/instructor/applications/${id}/approve`);
  return res.data;
};

// Not yet EXISTS 
export const rejectApplication = async (id: number, reason: string): Promise<InstructorApplication> => {
  const res = await axiosInstance.post(`/api/instructor/applications/${id}/reject`, { reason });
  return res.data;
};