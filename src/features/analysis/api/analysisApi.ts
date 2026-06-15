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