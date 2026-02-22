import {  useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../shared/api/axiosInstance'; 

export interface Tag {
    id: number;
    name: string;
}
export interface CourseMetaData {

    title: string;
    description: string;
    imageUrl: string;
    isCompleted: boolean;
    isEnrolled: boolean;
    price: number;
    rating: number;
    isBookmarked: boolean;
    startin: string;      
    endin: string;         
    createdOn: string;
    updatedOn: string | null;    
    updatedById: string | null;  
    createdById: string;
    tags: Tag[];
    learningOutcomes: string[];  
    prerequisites: string[];    
    isOwner: boolean;
    totalReviews: number;
    numberOfStudents: number;
}

export interface Lesson {
    description: string;
    duration: string;
    id: number;
    isLocked: boolean;
    isPreview: boolean;
    nextLessonId: number | null;
    orderIndex: number;
    previousLessonId: number;
    title: string;
    type: string;
    videoUrl: string;
}

export interface sectionDetails {
    id: number;
    createdById: string;
    createdOn: string;
    description: string;
    isDeleted: boolean;
    lessons: Lesson[];
    position: number;
    title: string;
    totalMinutes: number;
    updatedById: string | null;
    updatedOn: string | null;

}
export interface CourseContent {
    hours: number;
    keyId: string|null;
    sections: sectionDetails[];
}
const getCourseById = async (courseId:string): Promise<CourseContent> => {

    const response = await axiosInstance.get(`api/Courses/${courseId}`, {
    });
    
    return response.data;
};

const getCourseMetaDataById = async (courseId:string): Promise<CourseMetaData> => {

    const response = await axiosInstance.get(`api/Courses/${courseId}/metadata`, {
    });
    return response.data;
};

export const useGetCourseMetaDataById = (courseId:string) => {
    return useQuery({
        queryKey: ['coursesMetaDataById',courseId], 
        queryFn: () => getCourseMetaDataById(courseId),
    });
}


export const useGetCourseById = (courseId:string) => {
    return useQuery({
        queryKey: ['coursesById',courseId], 
        queryFn: () => getCourseById(courseId),
    });
};