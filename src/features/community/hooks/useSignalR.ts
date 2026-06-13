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

    // Keep latest callbacks in refs 
    const onMessageReceivedRef = useRef(onMessageReceived);
    const onMessageEditedRef = useRef(onMessageEdited);
    const onMessageDeletedRef = useRef(onMessageDeleted);
    const onUnreadIncrementRef = useRef(onUnreadIncrement);
    const activeChannelIdRef = useRef(activeChannelId);
    const channelIdsRef = useRef(channelIds);
    // const channelIdsKey = channelIds.join(',');

    useEffect(() => { channelIdsRef.current = channelIds; }, [channelIds]);
    useEffect(() => { activeChannelIdRef.current = activeChannelId; }, [activeChannelId]);
    useEffect(() => { onMessageReceivedRef.current = onMessageReceived; }, [onMessageReceived]);
    useEffect(() => { onMessageEditedRef.current = onMessageEdited; }, [onMessageEdited]);
    useEffect(() => { onMessageDeletedRef.current = onMessageDeleted; }, [onMessageDeleted]);
    useEffect(() => { onUnreadIncrementRef.current = onUnreadIncrement; }, [onUnreadIncrement]);
    useEffect(() => { activeChannelIdRef.current = activeChannelId; }, [activeChannelId]);

useEffect(() => {
    if (!courseId || channelIds.length === 0 || !token) return;

    let cancelled = false; 

    const url = `${HUB_URL}?courseId=${encodeURIComponent(courseId)}`;
console.log('Connecting with courseId:', courseId, 'channelIds:', channelIds);
    const connection = new signalR.HubConnectionBuilder()
        .withUrl(url, { accessTokenFactory: () => token })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

    connectionRef.current = connection;

    connection.on('ReceiveMessage', (msg: MessageDto) => {
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

    connection.on('PresenceChanged', (data: unknown) => console.log('PresenceChanged:', data));
    connection.on('UnreadNotification', (data: unknown) => console.log('UnreadNotification:', data));
    connection.on('InitialPresenceSync', (data: unknown) => console.log('InitialPresenceSync:', data));

    connection.onreconnecting(() => setConnectionState('reconnecting'));
    connection.onreconnected(async () => {
        setConnectionState('connected');
        for (const id of channelIdsRef.current) {
            await connection.invoke('JoinChannel', id).catch(console.error);
        }
    });
    connection.onclose((err) => {
    console.warn('SignalR closed:', err);
    setConnectionState('disconnected');
});

    setConnectionState('connecting');

        connection.start()
    .then(async () => {
        if (cancelled) {
            connection.stop();
            return;
        }
        setConnectionState('connected');
        console.log('✅ SignalR connected, joining channels:', channelIdsRef.current);
        
        for (const id of channelIdsRef.current) {
            if (connection.state !== signalR.HubConnectionState.Connected) {
                console.warn('Connection dropped before joining channel', id);
                break;
            }
            try {
                await connection.invoke('JoinChannel', id);
                console.log('Joined channel', id);
            } catch (err) {
                console.error(' JoinChannel failed for', id, err);
            }
        }
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
        setConnectionState('disconnected');
        connection.stop().catch(() => {});
    };
}, [courseId, token, channelIds.length]);

//     useEffect(() => {
//     const connection = connectionRef.current;
//     if (!connection || connection.state !== signalR.HubConnectionState.Connected) return;
//     for (const id of channelIds) {
//         connection.invoke('JoinChannel', id).catch(console.error);
//     }
//  }, [channelIds.join(',')]);

    const sendMessage = useCallback(
    async (content: string, replyToMessageId?: number) => {
        console.log('sendMessage called', { 
            hasConnection: !!connectionRef.current, 
            state: connectionState,
            activeChannelId 
        });
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
