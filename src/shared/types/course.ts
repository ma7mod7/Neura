export interface Tag {
    id: number;
    name: string;
}
export interface CourseListItem {
keyId: string | null;
    title: string | null;
    instructorName: string | null;
    imageUrl: string | null;
    price: number;
    rating: number;
    numberOfStudents: number;
    status: number;
    statusName: string | null;
    isEnrollmentOpen: boolean;
    isBookmarked: boolean;
    isEnrolled: boolean;
    totalReviews: number;
    tags: Tag[];
}

export interface PaginatedCourseResponse {
    items: CourseListItem[];
    pageNumber: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}