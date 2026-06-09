
import { useQuery, useQueries, type UseQueryResult } from '@tanstack/react-query';
import {
  getEditableCourses,
  getEnrolledCourses,
  getCourseContent,
} from '../api/analysisApi';
import type { ExamOption } from '../types/analysis.types';

const EXAM_LESSON_TYPE = 'Quiz'; 

// ─── Helper
function flattenExams(
  courses: { id: string; title: string }[],
  contentResults: UseQueryResult<unknown, unknown>[]
): ExamOption[] {
  const exams: ExamOption[] = [];
  contentResults.forEach((q, i) => {
    const course = courses[i];
    if (!q.data || !course) return;
    // getCourseContent returns { sections: sectionDetails[] }
    const content = q.data as { sections: { lessons: { id: number; title: string; type: string }[] }[] };
    content.sections?.forEach((section) => {
      section.lessons?.forEach((lesson) => {
        if (lesson.type?.toLowerCase() === EXAM_LESSON_TYPE.toLowerCase()) {
          exams.push({
            examId: String(lesson.id),
            examTitle: lesson.title,
            courseTitle: course.title,
            courseId: course.id,
          });
        }
      });
    });
  });
  return exams;
}

// ─── Instructor 
export function useInstructorExamList() {
  const coursesQuery = useQuery({
    queryKey: ['editableCourses'],
    queryFn: getEditableCourses,
    staleTime: 1000 * 60 * 5,
  });

  const courses = coursesQuery.data ?? [];

  const contentQueries = useQueries({
    queries: courses.map((course) => ({
      queryKey: ['courseContent', course.id],
      queryFn: () => getCourseContent(course.id),
      staleTime: 1000 * 60 * 5,
      enabled: courses.length > 0,
    })),
  });

  const exams = flattenExams(courses, contentQueries);
  const isLoading = coursesQuery.isLoading || contentQueries.some((q) => q.isLoading);
  const isError = coursesQuery.isError || contentQueries.some((q) => q.isError);

  return { exams, isLoading, isError };
}

// ─── Student
export function useStudentExamList() {
  const coursesQuery = useQuery({
    queryKey: ['enrolledCourses'],
    queryFn: getEnrolledCourses,
    staleTime: 1000 * 60 * 5,
  });

  const courses = coursesQuery.data ?? [];

  const contentQueries = useQueries({
    queries: courses.map((course) => ({
      queryKey: ['courseContent', course.id],  
      queryFn: () => getCourseContent(course.id),
      staleTime: 1000 * 60 * 5,
      enabled: courses.length > 0,
    })),
  });

  const exams = flattenExams(courses, contentQueries);
  const isLoading = coursesQuery.isLoading || contentQueries.some((q) => q.isLoading);
  const isError = coursesQuery.isError || contentQueries.some((q) => q.isError);

  return { exams, isLoading, isError };
}