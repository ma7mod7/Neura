import axiosInstance from '../../../shared/api/axiosInstance';
import type { MessagesPageDto } from '../types/communityTypes';

const BASE = 'api/community';

export async function getMessages(
    channelId: number,
    options?: { before?: number; pageSize?: number }
): Promise<MessagesPageDto> {
    const { data } = await axiosInstance.get<MessagesPageDto>(
        `${BASE}/channels/${channelId}/messages`,
        { params: { before: options?.before, pageSize: options?.pageSize } }
    );
    return data;
}

export async function editMessage(
    messageId: number,
    newContent: string
): Promise<{ id: number; channelId: number; newContent: string; editedAt: string }> {
    const { data } = await axiosInstance.patch(`${BASE}/messages/${messageId}`, { newContent });
    return data;
}

export async function deleteMessage(
    messageId: number
): Promise<{ id: number; channelId: number }> {
    const { data } = await axiosInstance.delete(`${BASE}/messages/${messageId}`);
    return data;
}