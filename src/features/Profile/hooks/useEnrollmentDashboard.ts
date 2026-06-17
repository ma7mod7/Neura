import { useQuery } from '@tanstack/react-query';
import { fetchEnrollmentDashboard } from '../api/profile.api';

export const useEnrollmentDashboard = () => {
    return useQuery({
        queryKey: ['enrollmentDashboard'],
        queryFn: fetchEnrollmentDashboard,
    });
};