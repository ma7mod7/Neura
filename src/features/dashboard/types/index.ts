// types.ts
export type CourseStatus = 'Active' | 'Pending';

export interface Course {
    id: string;
    title: string;
    instructor: string;
    image: string;
    status: CourseStatus;
    studentsCount: string;
}