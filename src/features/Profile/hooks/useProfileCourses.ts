import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchProfileCourses } from '../api/profile.api';

export const useProfileCourses = (tab: string, pageNumber: number, searchTerm: string) => {
    return useQuery({
        // قمنا بإضافة المتغير tab هنا لكي يتم تحديث البيانات فور تغير الفلتر
        queryKey: ['profileCourses', tab, pageNumber, searchTerm],
        queryFn: () => fetchProfileCourses(tab, pageNumber, searchTerm),
        placeholderData: keepPreviousData,
    });
};