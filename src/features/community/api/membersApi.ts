import axiosInstance from '../../../shared/api/axiosInstance';
import type { CourseMemberDto } from '../types/communityTypes';

const BASE = 'api/community';

export async function getCourseMembers(courseId: string): Promise<CourseMemberDto[]> {
    const { data } = await axiosInstance.get<CourseMemberDto[]>(`${BASE}/courses/${courseId}/members`);
    return data;
}

export async function getVoiceParticipants(channelId: number) {
    const { data } = await axiosInstance.get(`${BASE}/channels/${channelId}/voice-participants`);
    return data;
}