import { useQuery } from '@tanstack/react-query';
import { fetchProfileCourses } from '../api/profile.api';

export const useProfileCourses = (tab: string, pageNumber: number, searchTerm: string) => {
    return useQuery({
        
        queryKey: ['profile-courses', tab, pageNumber, searchTerm],
        queryFn: () => fetchProfileCourses(tab, pageNumber, searchTerm),
        
    });
};