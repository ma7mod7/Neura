import {  useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../shared/api/axiosInstance'; 
import type { PaginatedCourseResponse } from '../../../shared/types/course';




const getCourses = async (page: number): Promise<PaginatedCourseResponse> => {

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