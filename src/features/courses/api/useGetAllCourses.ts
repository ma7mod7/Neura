import {  useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../shared/api/axiosInstance'; 


export interface Tag {
    id: number;
    name: string;
}
export interface CourseListItem {
    keyId: string;
    title: string;
    instructorName: string;
    isCompleted: boolean;
    isEnrolled: boolean;
    price: number;
    imageUrl: string;
    rating: number;
    isBookmarked: boolean;
    tags: Tag[];
}

export interface CourseResponse {
    items: CourseListItem[];
    pageNumber: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

const getCourses = async (page: number): Promise<CourseResponse> => {

    const response = await axiosInstance.get('api/Courses', {
        params: {
            PageNumber: page, 
            pageSize:9      
        }
    });
    return response.data;
};

export const useGetCourses = (page: number) => {
    return useQuery({
        queryKey: ['courses', page], 
        queryFn: () => getCourses(page),
    });
};