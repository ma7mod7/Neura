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

// types.ts

export interface CourseActions {
    canEdit: boolean;
    canDelete: boolean;
    canActivate: boolean;
    canComplete: boolean;
    canReactivate: boolean;
    canUnpublish: boolean;
    canManageStudents: boolean;
    canManageInstructors: boolean;
    canAddSections: boolean;
    canAddLessons: boolean;
}

export interface ApiCourseItem {
    keyId: string;
    title: string;
    instructorName: string;
    imageUrl: string;
    status: number;
    statusName: string;
    isEnrollmentOpen: boolean;
    isPubliclyVisible: boolean;
    roleName: string;
    isOwner: boolean;
    isCoInstructor: boolean;
    numberOfStudents: number;
    availableActions: CourseActions;
    createdOn: string;
    updatedOn: string | null;
}

export interface PaginatedCourses {
    items: ApiCourseItem[];
    pageNumber: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface CourseApiResponse {
    totalOwnedCourses: number;
    totalCoInstructorCourses: number;
    courses: PaginatedCourses;
}