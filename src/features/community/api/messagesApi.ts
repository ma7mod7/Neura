import axiosInstance from '../../../shared/api/axiosInstance';
import type { MessagesPageDto } from '../types/communityTypes';

const BASE = 'api/community';

interface ApiResult<T> {
    value: T;
    isSuccess: boolean;
    isFailure: boolean;
    error: { code: string; message: string; statusCode: number | null };
}

export async function getMessages(
    channelId: number,
    options?: { before?: number; pageSize?: number }
): Promise<MessagesPageDto> {
    const { data } = await axiosInstance.get<ApiResult<MessagesPageDto>>(
        `${BASE}/channels/${channelId}/messages`,
        { params: { before: options?.before, pageSize: options?.pageSize } }
    );
    return data.value;
}

export async function editMessage(
    messageId: number,
    newContent: string
): Promise<{ id: number; channelId: number; newContent: string; editedAt: string }> {
    const { data } = await axiosInstance.patch<ApiResult<{ id: number; channelId: number; newContent: string; editedAt: string }>>(
        `${BASE}/messages/${messageId}`,
        { newContent }
    );
    return data.value;
}

export async function deleteMessage(
    messageId: number
): Promise<{ id: number; channelId: number }> {
    const { data } = await axiosInstance.delete<ApiResult<{ id: number; channelId: number }>>(
        `${BASE}/messages/${messageId}`
    );
    return data.value;
}