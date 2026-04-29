import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../shared/api/axiosInstance";
import { courseKeys } from "./queryKeys";
import type { Course, Section } from "./types";

// ── helpers ──────────────────────────────────────────────────

const extractArray = (data: any): any[] => {
  if (Array.isArray(data))        return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data))  return data.data;
  return [];
};

const deduplicateByKeyId = (courses: Course[]): Course[] => {
  const seen = new Set<string>();
  return courses.filter((c) => {
    if (seen.has(c.keyId)) return false;
    seen.add(c.keyId);
    return true;
  });
};

// ── API calls ────────────────────────────────────────────────

const getEditableCoursesApi = async (): Promise<Course[]> => {
  const { data } = await axiosInstance.get("/api/Courses/my/editable");
  return deduplicateByKeyId(extractArray(data));
};

const getAllCoursesApi = async (): Promise<Course[]> => {
  const { data } = await axiosInstance.get("/api/Courses");
  return deduplicateByKeyId(extractArray(data));
};

const getSectionsApi = async (courseId: string): Promise<Section[]> => {
  const { data } = await axiosInstance.get(`/api/courses/${courseId}/sections`);
  console.log("📦 Sections for", courseId, data);
  return extractArray(data);
};

// ── Hooks ─────────────────────────────────────────────────────

export const useEditableCourses = () => {
  return useQuery({
    queryKey: courseKeys.editable(),
    queryFn: async () => {
      const editable = await getEditableCoursesApi();
      if (editable.length === 0) return getAllCoursesApi();
      return editable;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useSections = (courseId: string) => {
  return useQuery({
    queryKey: courseKeys.sections(courseId),
    queryFn: () => getSectionsApi(courseId),
    enabled: !!courseId,
  });
};