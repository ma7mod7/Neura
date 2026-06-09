import axiosInstance from '../../../shared/api/axiosInstance';
import type { EditableCourse } from '../types/analysis.types';
export {getExamAnalytics,getExamAttempts,getScoreDistribution,getAttemptResults,} from '../../courses/api/examApi';
export { getCourseContent } from '../../courses/api/coursePlayerApi';

// ─── Instruct
export const getEditableCourses = async (): Promise<EditableCourse[]> => {
  const res = await axiosInstance.get('/api/Courses/my/editable', {
  params: { pageNumber: 1, pageSize: 100 }
});
  console.log('editable courses raw:', JSON.stringify(res.data, null, 2));
  const raw: { keyId?: string; id?: string; title: string; roleName: string }[] =
    res.data?.courses?.items ?? [];
  return raw.map((c) => ({
    id: c.keyId ?? c.id ?? '',
    title: c.title,
    role: c.roleName as 'Owner' | 'CoInstructor',
  }));
};

// ─── Student: enrolled courses
export const getEnrolledCourses = async (): Promise<{ id: string; title: string }[]> => {
  const res = await axiosInstance.get('/api/Courses', {
    params: { PageNumber: 1, pageSize: 50 },
  });
  const raw: { keyId: string; title: string; isEnrolled: boolean }[] =
    res.data?.items ?? res.data ?? [];
  return raw
    .filter((c) => c.isEnrolled)
    .map((c) => ({ id: c.keyId, title: c.title }));
};