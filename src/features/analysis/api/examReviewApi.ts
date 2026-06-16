import axiosInstance from '../../../shared/api/axiosInstance';
import type { ExamReviewDetail, ExamReviewItem, ExamReviewStats } from '../types/analysis.types';

// Returns exams whose status === 'PendingReview' that the current user
export const getPendingReviewExams = async (): Promise<ExamReviewItem[]> => {
  try {
    const res = await axiosInstance.get('/api/exams/review/pending');
    return res.data;
  } catch { return []; }
};

export const getReviewHistory = async (): Promise<ExamReviewItem[]> => {
  try {
    const res = await axiosInstance.get('/api/exams/review/history');
    return res.data;
  } catch { return []; }
};

export const getExamReviewStats = async (): Promise<ExamReviewStats> => {
  try {
    const res = await axiosInstance.get('/api/exams/review/stats');
    return res.data;
  } catch {
    return { pendingCount: 0, approvedToday: 0, rejectedCount: 0, totalReviewed: 0 };
  }
};

export const getExamReviewDetail = async (examId: number | string): Promise<ExamReviewDetail> => {
  const res = await axiosInstance.get(`/api/exams/${examId}/review`);
  return res.data;
};

// Instructor (Draft/Rejected)
export const submitExamForReview = async (examId: number | string) => {
  const res = await axiosInstance.post(`/api/exams/${examId}/submit-review`);
  return res.data;
};

// Reviewer: PendingReview
export const approveExam = async (examId: number | string) => {
  const res = await axiosInstance.post(`/api/exams/${examId}/approve`);
  return res.data;
};

// Reviewer: PendingReview
export const rejectExam = async (examId: number | string, reason: string) => {
  const res = await axiosInstance.post(`/api/exams/${examId}/reject`, { reason });
  return res.data;
};