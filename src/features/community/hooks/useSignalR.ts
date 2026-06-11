import { useEffect, useRef, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from '../../auth/hooks/useAuth';
import type { MessageDto } from '../types/communityTypes';

interface UseSignalROptions {
    channelId: number | null;
    onMessageReceived?: (msg: MessageDto) => void;
    onMessageEdited?: (messageId: number, newContent: string) => void;
    onMessageDeleted?: (messageId: number) => void;
}

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

const HUB_URL = 'https://neura-lms.runasp.net/hubs/community';

export function useSignalR({
    channelId,
    onMessageReceived,
    onMessageEdited,
    onMessageDeleted,
}: UseSignalROptions) {
    const { token } = useAuth();
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');

    useEffect(() => {
        if (!channelId || !token) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(HUB_URL, {
                accessTokenFactory: () => token,   
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        connectionRef.current = connection;

        connection.on('ReceiveMessage', (msg: MessageDto) => {
            onMessageReceived?.(msg);
        });
        connection.on('MessageEdited', (messageId: number, newContent: string) => {
            onMessageEdited?.(messageId, newContent);
        });
        connection.on('MessageDeleted', (messageId: number) => {
            onMessageDeleted?.(messageId);
        });

        connection.onreconnecting(() => setConnectionState('reconnecting'));
        connection.onreconnected(async () => {
            setConnectionState('connected');
            await connection.invoke('JoinChannel', channelId).catch(console.error);
        });
        connection.onclose(() => setConnectionState('disconnected'));

        setConnectionState('connecting');
        connection
            .start()
            .then(async () => {
                setConnectionState('connected');
                await connection.invoke('JoinChannel', channelId);
            })
            .catch(err => {
                console.error('SignalR connection failed:', err);
                setConnectionState('disconnected');
            });

        return () => {
            connection.invoke('LeaveChannel', channelId).catch(() => {});
            connection.stop();
        };
    }, [channelId, onMessageDeleted, onMessageEdited, onMessageReceived, token]);

    const sendMessage = useCallback(
        async (content: string, replyToMessageId?: number) => {
            if (!connectionRef.current || connectionState !== 'connected') return;
            await connectionRef.current.invoke('SendMessage', {
                channelId,
                content,
                replyToMessageId: replyToMessageId ?? null,
            });
        },
        [channelId, connectionState]
    );

    return { sendMessage, connectionState };
}