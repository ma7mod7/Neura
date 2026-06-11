import { useState, useEffect, useCallback } from 'react';
import { getMessages, editMessage, deleteMessage } from '../api/messagesApi';
import type { MessageDto } from '../types/communityTypes';

export function useMessages(channelId: number | null) {
    const [messages, setMessages] = useState<MessageDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Load initial messages 
    useEffect(() => {
        if (!channelId) return;
        setMessages([]);
        setNextCursor(null);
        setHasMore(false);
        setLoading(true);
        setError(null);

        getMessages(channelId, { pageSize: 50 })
            .then(data => {
                setMessages(data.messages ?? []);
                setHasMore(data.hasMore);
                setNextCursor(data.nextCursor);
            })
            .catch(() => setError('Failed to load messages'))
            .finally(() => setLoading(false));
    }, [channelId]);

    // Load older messages
    const loadMore = useCallback(async () => {
        if (!channelId || !hasMore || loadingMore || !nextCursor) return;
        setLoadingMore(true);
        try {
            const data = await getMessages(channelId, { before: nextCursor, pageSize: 50 });
            setMessages(prev => [...(data.messages ?? []), ...prev]);
            setHasMore(data.hasMore);
            setNextCursor(data.nextCursor);
        } catch {
            setError('Failed to load more messages');
        } finally {
            setLoadingMore(false);
        }
    }, [channelId, hasMore, loadingMore, nextCursor]);

    // Called when a new message arrives
    const appendMessage = useCallback((msg: MessageDto) => {
        setMessages(prev => [...prev, msg]);
    }, []);

    const updateMessage = useCallback((messageId: number, newContent: string) => {
        setMessages(prev =>
            prev.map(m => m.id === messageId
                ? { ...m, content: newContent, editedAt: new Date().toISOString() }
                : m
            )
        );
    }, []);

    const removeMessage = useCallback((messageId: number) => {
        setMessages(prev =>
            prev.map(m => m.id === messageId ? { ...m, isDeleted: true, content: '' } : m)
        );
    }, []);

    const handleEdit = async (messageId: number, newContent: string) => {
        const result = await editMessage(messageId, newContent);
        updateMessage(messageId, result.newContent ?? newContent);
    };

    const handleDelete = async (messageId: number) => {
        await deleteMessage(messageId);
        removeMessage(messageId);
    };

    return {
        messages, loading, loadingMore, hasMore, error,
        loadMore, appendMessage, updateMessage, removeMessage,
        handleEdit, handleDelete,
    };
}