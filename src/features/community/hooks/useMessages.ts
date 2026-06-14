import { useState, useEffect, useCallback, useRef } from 'react';
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

function dedupe(msgs: MessageDto[]): MessageDto[] {
    const seen = new Set<number>();
    const result: MessageDto[] = [];
    for (const m of msgs) {
        if (!seen.has(m.id)) {
            seen.add(m.id);
            result.push(m);
        }
    }
    return result.sort((a, b) => a.id - b.id);
}

export function useMessages(channelId: number | null) {
    const [messages, setMessages] = useState<MessageDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Track all real message IDs we've seen for this channel
    const seenIdsRef = useRef<Set<number>>(new Set());

    useEffect(() => {
        if (!channelId) {
            setMessages([]);
            setHasMore(false);
            setNextCursor(null);
            seenIdsRef.current = new Set();
            return;
        }

        // Reset seen IDs when channel changes
        seenIdsRef.current = new Set();

        const cached = readCache(channelId);
        if (cached) {
            const sorted = dedupe(cached.messages ?? []);
            sorted.forEach(m => seenIdsRef.current.add(m.id));
            setMessages(sorted);
            setHasMore(cached.hasMore);
            setNextCursor(cached.nextCursor);

            // Background refresh
            getMessages(channelId, { pageSize: 50 })
                .then(data => {
                    const fresh = dedupe(data.messages ?? []);
                    setMessages(prev => {
                        const prevIds = new Set(prev.map(m => m.id));
                        const newOnes = fresh.filter(m => !prevIds.has(m.id));
                        if (newOnes.length === 0) return prev;
                        newOnes.forEach(m => seenIdsRef.current.add(m.id));
                        const merged = dedupe([...prev, ...newOnes]);
                        writeCache(channelId, {
                            messages: merged,
                            hasMore: data.hasMore,
                            nextCursor: data.nextCursor,
                        });
                        return merged;
                    });
                    setHasMore(data.hasMore);
                    setNextCursor(data.nextCursor);
                })
                .catch(() => {});
            return;
        }

        // No cache — fetch fresh
        setMessages([]);
        setNextCursor(null);
        setHasMore(false);
        setLoading(true);
        setError(null);

        getMessages(channelId, { pageSize: 50 })
            .then(data => {
                const msgs = dedupe(data.messages ?? []);
                msgs.forEach(m => seenIdsRef.current.add(m.id));
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
            const older = dedupe(data.messages ?? []);
            setMessages(prev => {
                const prevIds = new Set(prev.map(m => m.id));
                const newOnes = older.filter(m => !prevIds.has(m.id));
                newOnes.forEach(m => seenIdsRef.current.add(m.id));
                const merged = dedupe([...newOnes, ...prev]);
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

        const isReal = msg.id < 1_700_000_000_000;

        // If it's a real message and we've already seen it, skip entirely
        if (isReal && seenIdsRef.current.has(msg.id)) return;

        setMessages(prev => {
            // Double-check in state too
            if (prev.some(m => m.id === msg.id)) return prev;

            let filtered = prev;
            if (isReal) {
                // Remove matching optimistic message
                let removedOne = false;
                filtered = prev.filter(m => {
                    if (
                        !removedOne &&
                        m.id > 1_700_000_000_000 &&
                        m.content === msg.content &&
                        m.senderId === msg.senderId
                    ) {
                        removedOne = true;
                        return false;
                    }
                    return true;
                });
                seenIdsRef.current.add(msg.id);
            }

            const updated = dedupe([...filtered, msg]);

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
            const updated = prev.map(m =>
                m.id === messageId
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
            const updated = prev.map(m =>
                m.id === messageId ? { ...m, isDeleted: true, content: '' } : m
            );
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