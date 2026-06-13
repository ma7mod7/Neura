import { useState, useEffect, useCallback } from 'react';
import { getMessages, editMessage, deleteMessage } from '../api/messagesApi';
import type { MessageDto } from '../types/communityTypes';

type MessageCache = {
    messages: MessageDto[];
    hasMore: boolean;
    nextCursor: number | null;
};

const CACHE_PREFIX = 'msg_cache_';

function readCache(channelId: number): MessageCache | null {
    try {
        const raw = localStorage.getItem(CACHE_PREFIX + channelId);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function writeCache(channelId: number, data: MessageCache) {
    try {
        localStorage.setItem(CACHE_PREFIX + channelId, JSON.stringify(data));
    } catch {}
}

export function useMessages(channelId: number | null) {
    const [messages, setMessages] = useState<MessageDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!channelId) return;

        const cached = readCache(channelId);
        if (cached) {
            setMessages(cached.messages);
            setHasMore(cached.hasMore);
            setNextCursor(cached.nextCursor);
            const lastId = cached.messages[cached.messages.length - 1]?.id;
            getMessages(channelId, { pageSize: 50 })
                .then(data => {
                    const fresh = data.messages ?? [];
                    const newOnes = fresh.filter(m => m.id > (lastId ?? 0));
                    if (newOnes.length > 0) {
                        setMessages(prev => {
                            const merged = [...prev, ...newOnes];
                            writeCache(channelId, { messages: merged, hasMore: data.hasMore, nextCursor: data.nextCursor });
                            return merged;
                        });
                    }
                })
                .catch(() => {});
            return;
        }

        setMessages([]);
        setNextCursor(null);
        setHasMore(false);
        setLoading(true);
        setError(null);

        getMessages(channelId, { pageSize: 50 })
            .then(data => {
                const msgs = data.messages ?? [];
                setMessages(msgs);
                setHasMore(data.hasMore);
                setNextCursor(data.nextCursor);
                writeCache(channelId, {
                    messages: msgs,
                    hasMore: data.hasMore,
                    nextCursor: data.nextCursor,
                });
            })
            .catch(() => setError('Failed to load messages'))
            .finally(() => setLoading(false));
    }, [channelId]);

    const loadMore = useCallback(async () => {
        if (!channelId || !hasMore || loadingMore || !nextCursor) return;
        setLoadingMore(true);
        try {
            const data = await getMessages(channelId, { before: nextCursor, pageSize: 50 });
            const older = data.messages ?? [];
            setMessages(prev => {
                const merged = [...older, ...prev];
                writeCache(channelId, {
                    messages: merged,
                    hasMore: data.hasMore,
                    nextCursor: data.nextCursor,
                });
                return merged;
            });
            setHasMore(data.hasMore);
            setNextCursor(data.nextCursor);
        } catch {
            setError('Failed to load more messages');
        } finally {
            setLoadingMore(false);
        }
    }, [channelId, hasMore, loadingMore, nextCursor]);

    const appendMessage = useCallback((msg: MessageDto) => {
        if (channelId && msg.channelId !== channelId) return;
        setMessages(prev => {
            // Already in list 
            if (prev.some(m => m.id === msg.id)) return prev;

            const isRealMessage = msg.id < 1_700_000_000_000;

            let filtered = prev;
            if (isRealMessage) {
                
                let removedOne = false;
                filtered = prev.filter(m => {
                    if (!removedOne && m.id > 1_700_000_000_000 && m.content === msg.content && m.senderId === msg.senderId) {
                        removedOne = true;
                        return false; 
                    }
                    return true;
                });
            }

            const updated = [...filtered, msg];
            if (channelId) {
                const cached = readCache(channelId);
                writeCache(channelId, {
                    messages: updated,
                    hasMore: cached?.hasMore ?? false,
                    nextCursor: cached?.nextCursor ?? null,
                });
            }
            return updated;
        });
    }, [channelId]);

    const updateMessage = useCallback((messageId: number, newContent: string) => {
        setMessages(prev => {
            const updated = prev.map(m => m.id === messageId
                ? { ...m, content: newContent, editedAt: new Date().toISOString() }
                : m
            );
            if (channelId) {
                const cached = readCache(channelId);
                writeCache(channelId, { ...cached!, messages: updated });
            }
            return updated;
        });
    }, [channelId]);

    const removeMessage = useCallback((messageId: number) => {
        setMessages(prev => {
            const updated = prev.map(m => m.id === messageId ? { ...m, isDeleted: true, content: '' } : m);
            if (channelId) {
                const cached = readCache(channelId);
                writeCache(channelId, { ...cached!, messages: updated });
            }
            return updated;
        });
    }, [channelId]);

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