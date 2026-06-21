import axiosInstance from '../../../shared/api/axiosInstance';
import type { AttemptReviewItem, AttemptReviewDetail, AttemptReviewStats } from '../types/analysis.types';

// GET all violations (cheating attempts) for an exam
export const getPendingAttemptReviews = async (): Promise<AttemptReviewItem[]> => {
  try {
    const res = await axiosInstance.get('/api/ExamAttempts/review/pending');
    return res.data;
  } catch { return []; }
};

export const getAttemptReviewHistory = async (): Promise<AttemptReviewItem[]> => {
  try {
    const res = await axiosInstance.get('/api/ExamAttempts/review/history');
    return res.data;
  } catch { return []; }
};

export const getAttemptReviewStats = async (): Promise<AttemptReviewStats> => {
  try {
    const res = await axiosInstance.get('/api/ExamAttempts/review/stats');
    return res.data;
  } catch {
    return { pendingCount: 0, approvedToday: 0, rejectedToday: 0, totalReviewed: 0 };
  }
};

export const getAttemptReviewDetail = async (attemptId: number | string): Promise<AttemptReviewDetail> => {
  const res = await axiosInstance.get(`/api/ExamAttempts/${attemptId}/results`);
  return res.data;
};

// GET violations for a specific exam
export const getExamViolations = async (examId: number | string) => {
  try {
    const res = await axiosInstance.get(`/api/exams/${examId}/analytics/violations`);
    return res.data;
  } catch (err: any) {
    // 404 = no violations for this exam, treat as empty
    if (err?.response?.status === 404) return { violations: [], totalCount: 0 };
    return { violations: [], totalCount: 0 };
  }
};

// GET single violation detail
export const getViolationDetail = async (examId: number | string, violationId: number | string) => {
  const res = await axiosInstance.get(`/api/exams/${examId}/analytics/violations/${violationId}`);
  return res.data;
};

// RESOLVE violation = approve (pass as-is)
// export const resolveViolation = async (examId: number | string, attemptId: number | string) => {
//   const res = await axiosInstance.put(
//     `/api/exams/${examId}/analytics/attempts/${attemptId}/resolve-violation`
//   );
//   return res.data;
// };


// FLAG violation = reject (mark as cheating/failed)
// export const flagViolation = async (examId: number | string, attemptId: number | string) => {
//   const res = await axiosInstance.put(
//     `/api/exams/${examId}/analytics/attempts/${attemptId}/flag-violation`
//   );
//   return res.data;
// };
export const resolveViolation = async (
  examId: number | string,
  attemptId: number | string,
  newScore: number = 0,
  notes: string | null = null
) => {
  const res = await axiosInstance.put(
    `/api/exams/${examId}/analytics/attempts/${attemptId}/resolve-violation`,
    { newScore, notes }
  );
  return res.data;
};

export const flagViolation = async (
  examId: number | string,
  attemptId: number | string,
  reason: string | null = null
) => {
  const res = await axiosInstance.put(
    `/api/exams/${examId}/analytics/attempts/${attemptId}/flag-violation`,
    { reason }
  );
  return res.data;
};

export const getMyAttemptReviewStatus = async (attemptId: number | string) => {
  const res = await axiosInstance.get(`/api/ExamAttempts/${attemptId}/results`);
  const data = res.data;
  const status = data.areGradesPublished
    ? (data.passed ? 'Approved' : 'Rejected')
    : 'UnderReview';
  return { status, reviewedAt: data.submittedAt ?? null };
};