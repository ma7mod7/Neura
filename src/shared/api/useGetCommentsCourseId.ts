import {  useQuery } from '@tanstack/react-query';
import axiosInstance from './axiosInstance';

export interface CommentItem {

    name: string;
    feedback: string;
}

export interface Reviews {
    pageNumber: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    items: CommentItem[];
    
}


const getReviewsById = async (courseId:string): Promise<Reviews> => {

    const response = await axiosInstance.get(`api/Reviews/course/${courseId}`, {
    });
    console.log(response)
    
    return response.data;
};


export const useGetReviewsById = (courseId:string) => {
    return useQuery({
        queryKey: ['reviews',courseId], 
        queryFn: () => getReviewsById(courseId),
    });
};