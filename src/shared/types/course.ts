export interface Tag {
    id: number;
    name: string;
}
export interface CourseListItem {
    keyId: string ;
    title: string ;
    instructorName: string ;
    imageUrl: string ;
    price: number;
    rating: number;
    isEnrollmentOpen: boolean;
    isBookmarked: boolean;
    isEnrolled: boolean;
    totalReviews: number;
    tags: Tag[];
    numberOfLessons: number;
    hours: number;
}

export interface PaginatedCourseResponse {
    items: CourseListItem[];
    pageNumber: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}