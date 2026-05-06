import axiosInstance from '../../../shared/api/axiosInstance';
import type { PaginatedCourseResponse } from '../../../shared/types/course';

// تأكد من استيراد axiosInstance و PaginatedCourseResponse بشكل صحيح في أعلى الملف

export const fetchProfileCourses = async (
    tab: string,
    pageNumber: number,
    searchTerm: string
): Promise<PaginatedCourseResponse> => {
    
    let courseStatus: number | undefined = undefined;
    let isBookmarked: boolean | undefined = undefined;

    switch (tab) {
        case 'In Progress': 
            courseStatus = 2; 
            break;
        case 'Completed': 
            courseStatus = 3; 
            break;
        case 'Bookmarked': 
            isBookmarked = true; 
            break;
        case 'My Courses':
        default: 
            break; 
    }

    const response = await axiosInstance.get<PaginatedCourseResponse>('/api/courses/enrolled', {
        params: {
            PageNumber: pageNumber,
            PageSize: 6,
            SearchValue: searchTerm || undefined, 
            CourseStatus: courseStatus,
            IsBookmarked: isBookmarked
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