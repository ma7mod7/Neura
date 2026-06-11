import axiosInstance from '../../../shared/api/axiosInstance';
import type { CommunitySpace } from '../types/communityTypes';

interface EnrolledCourse {
    keyId: string;
    title: string;
    imageUrl: string | null;
    isEnrolled: boolean;
    isOwner: boolean;
}

interface CoursesResponse {
    items: EnrolledCourse[];
    pageNumber: number;
    totalPages: number;
}

export async function getEnrolledSpaces(): Promise<CommunitySpace[]> {
    const allCourses: EnrolledCourse[] = [];
    let page = 1;
    let totalPages = 1;

    do {
        const { data } = await axiosInstance.get<CoursesResponse>('api/Courses', {
            params: { PageNumber: page, pageSize: 50 },
        });

        const items = data?.items ?? (Array.isArray(data) ? (data as unknown as EnrolledCourse[]) : []);
        allCourses.push(...items);
        totalPages = data?.totalPages ?? 1;
        page++;
    } while (page <= totalPages);

    return allCourses
        .filter(c => c.isEnrolled || c.isOwner)
        .map((c): CommunitySpace => ({
            id: c.keyId,
            name: c.title,
            imageUrl: c.imageUrl
                ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(c.title)}&background=0D8ABC&color=fff`,
            isPrivate: false,
            channels: [],
        }));
}