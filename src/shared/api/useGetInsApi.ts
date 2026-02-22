import {  useQuery } from '@tanstack/react-query';
import axiosInstance from './axiosInstance';



export interface User {
    id: string;
    imageUrl: string;
    name: string;
    rating: number;
    totalCourses: number;
    totalReviews: number;
    totalStudents: number;
    headline: string;
    
}


const getInstById = async (courseId:string): Promise<User> => {

    const response = await axiosInstance.get(`api/Users/course/${courseId}`, {
    });
    
    return response.data;
};


export const useGetInstById = (courseId:string) => {
    return useQuery({
        queryKey: ['instById',courseId], 
        queryFn: () => getInstById(courseId),
    });
};