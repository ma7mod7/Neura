import { useEffect, useRef, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from '../../auth/hooks/useAuth';
import type { MessageDto } from '../types/communityTypes';

interface UseSignalROptions {
    courseId: string | null;
    channelIds: number[];
    activeChannelId: number | null;
    onMessageReceived?: (msg: MessageDto) => void;
    onMessageEdited?: (messageId: number, newContent: string) => void;
    onMessageDeleted?: (messageId: number) => void;
    onUnreadIncrement?: (channelId: number) => void;
}

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

const HUB_URL = 'https://neura-lms.runasp.net/hubs/community';

export function useSignalR({
    courseId,
    channelIds,
    activeChannelId,
    onMessageReceived,
    onMessageEdited,
    onMessageDeleted,
    onUnreadIncrement,
}: UseSignalROptions) {
    const { token } = useAuth();
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const joinedChannelsRef = useRef<Set<number>>(new Set());

    const onMessageReceivedRef = useRef(onMessageReceived);
    const onMessageEditedRef = useRef(onMessageEdited);
    const onMessageDeletedRef = useRef(onMessageDeleted);
    const onUnreadIncrementRef = useRef(onUnreadIncrement);
    const activeChannelIdRef = useRef(activeChannelId);
    const channelIdsRef = useRef(channelIds);

    useEffect(() => { channelIdsRef.current = channelIds; }, [channelIds]);
    useEffect(() => { activeChannelIdRef.current = activeChannelId; }, [activeChannelId]);
    useEffect(() => { onMessageReceivedRef.current = onMessageReceived; }, [onMessageReceived]);
    useEffect(() => { onMessageEditedRef.current = onMessageEdited; }, [onMessageEdited]);
    useEffect(() => { onMessageDeletedRef.current = onMessageDeleted; }, [onMessageDeleted]);
    useEffect(() => { onUnreadIncrementRef.current = onUnreadIncrement; }, [onUnreadIncrement]);

    // Main connection — only recreated when courseId or token changes
    useEffect(() => {
        if (!courseId || !token) return;

        let cancelled = false;
        joinedChannelsRef.current = new Set();

        const url = `${HUB_URL}?courseId=${encodeURIComponent(courseId)}`;
        console.log('🔌 Creating SignalR connection for courseId:', courseId);

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(url, { accessTokenFactory: () => token })
            .withAutomaticReconnect([0, 2000, 5000, 10000])
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        connectionRef.current = connection;
        (window as any).__signalRConnection = connection;

        connection.on('ReceiveMessage', (msg: MessageDto) => {
            console.log('📨 ReceiveMessage:', msg, '| activeChannel:', activeChannelIdRef.current);
            onMessageReceivedRef.current?.(msg);
            if (msg.channelId !== activeChannelIdRef.current) {
                onUnreadIncrementRef.current?.(msg.channelId);
            }
        });

        connection.on('MessageEdited', (messageId: number, newContent: string) => {
            onMessageEditedRef.current?.(messageId, newContent);
        });

        connection.on('MessageDeleted', (messageId: number) => {
            onMessageDeletedRef.current?.(messageId);
        });

        connection.on('Error', (message: string) => {
            console.error(' Hub Error:', message);
        });

        connection.on('PresenceChanged', (data: unknown) => console.log('PresenceChanged:', data));
        connection.on('UnreadNotification', (data: unknown) => console.log('UnreadNotification:', data));
        connection.on('InitialPresenceSync', (data: unknown) => console.log('InitialPresenceSync:', data));

        connection.onreconnecting(() => setConnectionState('reconnecting'));
        connection.onreconnected(async () => {
            setConnectionState('connected');
            // Rejoin all channels after reconnect
            joinedChannelsRef.current = new Set();
            for (const id of channelIdsRef.current) {
                try {
                    await connection.invoke('JoinChannel', id);
                    joinedChannelsRef.current.add(id);
                    console.log(' Rejoined channel after reconnect:', id);
                } catch (err) {
                    console.error(' Failed to rejoin channel:', id, err);
                }
            }
        });

        connection.onclose((err) => {
            if (!cancelled) {
                console.warn('SignalR closed:', err);
                setConnectionState('disconnected');
            }
        });

        setConnectionState('connecting');
        connection.start()
            .then(() => {
                if (cancelled) { connection.stop(); return; }
                setConnectionState('connected');
                // Channels are joined by the useEffect below once
                // connectionState === 'connected' and channelIds are ready
            })
            .catch(err => {
                if (!cancelled) {
                    console.error('SignalR connection failed:', err);
                    setConnectionState('disconnected');
                }
            });

        return () => {
            cancelled = true;
            connectionRef.current = null;
            joinedChannelsRef.current = new Set();
            setConnectionState('disconnected');
            connection.stop().catch(() => {});
        };
    }, [courseId, token]);

    // Join any channels not yet joined — runs when channelIds arrive or connection becomes ready
    useEffect(() => {
        if (channelIds.length === 0) return;
        const connection = connectionRef.current;
        if (!connection || connection.state !== signalR.HubConnectionState.Connected) return;

        const newChannels = channelIds.filter(id => !joinedChannelsRef.current.has(id));
        if (newChannels.length === 0) return;

        console.log('🔗 Joining channels:', newChannels);
        Promise.all(
            newChannels.map(id =>
                connection.invoke('JoinChannel', id)
                    .then(() => {
                        joinedChannelsRef.current.add(id);
                        console.log(' Joined channel:', id);
                    })
                    .catch(err => console.error(' JoinChannel failed:', id, err))
            )
        );
    }, [channelIds.join(','), connectionState]);

    const sendMessage = useCallback(
        async (content: string, replyToMessageId?: number) => {
            if (!connectionRef.current || connectionState !== 'connected') return;
            await connectionRef.current.invoke('SendMessage', {
                channelId: activeChannelId,
                content,
                replyToMessageId: replyToMessageId ?? null,
            }).catch(err => console.error('SendMessage error:', err));
        },
        [activeChannelId, connectionState]
    );

    return { sendMessage, connectionState };
}