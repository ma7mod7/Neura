import axiosInstance from '../../../shared/api/axiosInstance';
import type { PaginatedCourseResponse } from '../../../shared/types/course';

export const fetchProfileCourses = async (
    tab: string,
    pageNumber: number,
    searchTerm: string
): Promise<PaginatedCourseResponse> => {
    let filterStatus = '';
    switch (tab) {
        case 'In Progress': filterStatus = 'in-progress'; break;
        case 'Completed': filterStatus = 'completed'; break;
        case 'Bookmarked': filterStatus = 'isBookmarked'; break;
        default: filterStatus = 'all'; break; 
    }

    const response = await axiosInstance.get<PaginatedCourseResponse>('/api/courses/enrolled', {
        params: {
            filters: filterStatus,
            pageNumber: pageNumber,
            SearchValue: searchTerm || undefined, 
            PageSize:6 ,
        },
    });

    return response.data;
};

export interface UpdateNamePayload {
    firstName: string | null;
    lastName: string | null;
}

export const updateProfileName = async (data: UpdateNamePayload) => {
    const response = await axiosInstance.put('/me', data, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

export interface UpdatePasswordPayload {
    currentPassword: string | null;
    newPassword: string | null;
}

export const updateProfilePassword = async (data: UpdatePasswordPayload) => {
    const response = await axiosInstance.put('/me/change-password', data, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};