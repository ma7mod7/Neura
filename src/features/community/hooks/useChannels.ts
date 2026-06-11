import { useState, useEffect, useCallback } from 'react';
import { getChannels, createChannel, deleteChannel, updateChannel } from '../api/channelsApi';
import type { ChannelDto } from '../types/communityTypes';

export function useChannels(courseId: string | null) {
    const [channels, setChannels] = useState<ChannelDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchChannels = useCallback(async () => {
        if (!courseId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getChannels(courseId);
            setChannels(data.sort((a, b) => a.position - b.position));
        } catch (e) {
            setError('Failed to load channels');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchChannels();
    }, [fetchChannels]);

    const addChannel = async (name: string, type: 0 | 1 = 0, topic?: string) => {
        if (!courseId) return;
        const newChannel = await createChannel(courseId, { name, type, topic });
        setChannels(prev => [...prev, newChannel].sort((a, b) => a.position - b.position));
        return newChannel;
    };

    const removeChannel = async (channelId: number) => {
        await deleteChannel(channelId);
        setChannels(prev => prev.filter(c => c.id !== channelId));
    };

    const renameChannel = async (channelId: number, name: string, topic?: string) => {
        const updated = await updateChannel(channelId, { name, topic });
        setChannels(prev => prev.map(c => c.id === channelId ? updated : c));
        return updated;
    };

    return { channels, loading, error, refetch: fetchChannels, addChannel, removeChannel, renameChannel };
}