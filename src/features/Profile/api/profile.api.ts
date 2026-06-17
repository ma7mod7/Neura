import axiosInstance from '../../../shared/api/axiosInstance';
import type { PaginatedCourseResponse } from '../../../shared/types/course';

export const fetchProfileCourses = async (
    tab: string,
    pageNumber: number,
    searchTerm: string
): Promise<PaginatedCourseResponse> => {

    let courseStatus: number | undefined = undefined;
    let endpoint = '/api/courses/enrolled';

    switch (tab) {
        case 'In Progress':
            courseStatus = 2;
            break;
        case 'Completed':
            courseStatus = 3;
            break;
        case 'Bookmarked':
            endpoint = '/api/Courses/bookmarked';
            break;
        case 'My Courses':
        default:
            break;
    }

    const response = await axiosInstance.get<PaginatedCourseResponse>(endpoint, {
        params: {
            PageNumber: pageNumber,
            PageSize: 6,
            SearchValue: searchTerm || undefined,
            CourseStatus: courseStatus,
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

export const updateProfileImage = async (imageFile: File) => {
    const formData = new FormData();
    formData.append('Image', imageFile);

    const response = await axiosInstance.put('/Auth/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
    });

    console.log("image updated res", response);
    return response.data;
};

export const fetchEnrollmentDashboard = async () => {
    const response = await axiosInstance.get('/api/courses/enrollment-dashboard');
    return response.data;
};
