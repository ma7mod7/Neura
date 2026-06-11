import axiosInstance from '../../../shared/api/axiosInstance';
import type { ChannelDto } from '../types/communityTypes';

const BASE = 'api/community';

export async function getChannels(courseId: string): Promise<ChannelDto[]> {
    const { data } = await axiosInstance.get<ChannelDto[]>(`${BASE}/courses/${courseId}/channels`);
    return data;
}

export async function createChannel(
    courseId: string,
    payload: { name: string; topic?: string; type: 0 | 1 }
): Promise<ChannelDto> {
    const { data } = await axiosInstance.post<ChannelDto>(`${BASE}/courses/${courseId}/channels`, payload);
    return data;
}

export async function updateChannel(
    channelId: number,
    payload: { name?: string; topic?: string }
): Promise<ChannelDto> {
    const { data } = await axiosInstance.put<ChannelDto>(`${BASE}/channels/${channelId}`, payload);
    return data;
}

export async function deleteChannel(channelId: number): Promise<void> {
    await axiosInstance.delete(`${BASE}/channels/${channelId}`);
}

export async function reorderChannels(
    courseId: string,
    channelIds: number[]
): Promise<ChannelDto[]> {
    const { data } = await axiosInstance.put<ChannelDto[]>(
        `${BASE}/courses/${courseId}/channels/reorder`,
        { channelIds }
    );
    return data;
}