import {  useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../shared/api/axiosInstance'; 

export interface Tag {
    id: number;
    name: string;
}
export interface CourseDetails {
    keyId: string;
    title: string;
    instructorName: string;
    description: string;
    isCompleted: boolean;
    isEnrolled: boolean;
    price: number;
    imageUrl: string;
    rating: number;
    isBookmarked: boolean;
    startin: string;      
    endin: string;         
    createdOn: string;
    updatedOn: string | null;    
    updatedById: string | null;  
    createdById: string;
    sections: any[];             
    tags: Tag[];
    learningOutcomes: string[];  
    prerequisites: string[];    
}

const getCoursesById = async (courseId:string): Promise<CourseDetails> => {

    const response = await axiosInstance.get(`api/Courses/${courseId}`, {
    });
    return response.data;
};

export const useGetCourses = (courseId:string) => {
    return useQuery({
        queryKey: ['coursesById',courseId], 
        queryFn: () => getCoursesById(courseId),
    });
};