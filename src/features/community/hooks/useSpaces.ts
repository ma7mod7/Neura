import { useState, useEffect } from 'react';
import { getEnrolledSpaces } from '../api/spacesApi';
import type { CommunitySpace } from '../types/communityTypes';

export function useSpaces() {
    const [spaces, setSpaces]   = useState<CommunitySpace[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        getEnrolledSpaces()
            .then(setSpaces)
            .catch(() => setError('Failed to load courses'))
            .finally(() => setLoading(false));
    }, []);

    return { spaces, loading, error };
}