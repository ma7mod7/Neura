import axiosInstance from '../../../shared/api/axiosInstance';
// import type { EditableCourse } from '../types/analysis.types';
export {getExamAnalytics,getExamAttempts,getScoreDistribution,getAttemptResults,} from '../../courses/api/examApi';
export { getCourseContent } from '../../courses/api/coursePlayerApi';

// ─── Instruct
export const getTeachingCourses = async (): Promise<{ id: string; title: string }[]> => {
  const res = await axiosInstance.get('/api/courses/teaching');
  const raw: { keyId: string; title: string }[] = res.data ?? [];
  return raw.map((c) => ({ id: c.keyId, title: c.title }));
};

// ─── Student: enrolled courses
export const getEnrolledCourses = async (): Promise<{ id: string; title: string }[]> => {
  const res = await axiosInstance.get('/api/courses/enrolled', {
    params: { PageNumber: 1, PageSize: 50 },
  });
  const raw: { keyId: string; title: string }[] = res.data?.items ?? [];
  return raw.map((c) => ({ id: c.keyId, title: c.title }));
};

export const getStudentExamAnalytics = async (examId: string) => {
  const res = await axiosInstance.get(`/api/exams/${examId}/analytics/student`);
  return res.data;
};

export const getStudentScoreDistribution = async (examId: string) => {
  const res = await axiosInstance.get(`/api/exams/${examId}/analytics/student/score-distribution`);
  return res.data?.buckets ?? [];
};

export const getStudentAttempts = async (examId: string) => {
  const res = await axiosInstance.get(`/api/exams/${examId}/analytics/student/attempts`);
  return res.data?.attempts ?? [];
};
export const publishExamGrades = async (examKeyId: string) => {
  const examRes = await axiosInstance.get(`/api/Exams/by-lesson/${examKeyId}`);
  const internalExamId = examRes.data?.id ?? examRes.data?.examId;
  if (!internalExamId) throw new Error('Could not resolve exam ID');
  try {
    const res = await axiosInstance.put(`/api/Exams/${internalExamId}/grades/publish`);
    return res.data;
  } catch (err: any) {
    // Already published = treat as success, not an error
    if (err?.response?.status === 400) {
      const errors = err.response.data?.errors ?? [];
      const alreadyPublished = Array.isArray(errors)
        ? errors.some((e: string) => e.includes('GradesAlreadyPublished'))
        : String(errors).includes('GradesAlreadyPublished');
      if (alreadyPublished) return { alreadyPublished: true };
    }
    throw err;
  }
};
export const getExamViolationsByLesson = async (lessonId: string) => {
  // Resolve internal exam ID first
  const examRes = await axiosInstance.get(`/api/Exams/by-lesson/${lessonId}`);
  const internalExamId = examRes.data?.id ?? examRes.data?.examId;
  if (!internalExamId) return [];
  const res = await axiosInstance.get(`/api/exams/${internalExamId}/analytics/violations`);
  return Array.isArray(res.data) ? res.data : res.data?.violations ?? [];
};