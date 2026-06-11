import { useState, useEffect } from 'react';
import { getCourseMembers } from '../api/membersApi';
import type { CourseMemberDto } from '../types/communityTypes';

export function useMembers(courseId: string | null) {
    const [members, setMembers] = useState<CourseMemberDto[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!courseId) return;
        setLoading(true);
        getCourseMembers(courseId)
            .then(setMembers)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [courseId]);

    const updatePresence = (userId: string, isOnline: boolean) => {
        setMembers(prev =>
            prev.map(m => m.userId === userId ? { ...m, isOnline } : m)
        );
    };

    return { members, loading, updatePresence };
}