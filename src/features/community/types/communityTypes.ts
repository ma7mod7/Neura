// src/types/communityTypes.ts

export type Role = 'admin' | 'moderator' | 'teacher' | 'student';
export type UserStatus = 'online' | 'idle' | 'dnd' | 'offline';
export type ChannelType = 'text' | 'voice' | 'announcement';

export interface CommunityMember {
    id: string;
    name: string;
    avatar?: string;
    role: Role;
    status: UserStatus;
    isTyping?: boolean;
}

export interface CommunityChannel {
    id: string;
    spaceId: string;
    name: string;
    type: ChannelType;
    isLocked?: boolean;
    unreadCount?: number;
}

export interface CommunitySpace {
    id: string;
    name: string;
    imageUrl?: string;
    isPrivate: boolean;
    channels: CommunityChannel[];
}

export interface CommunityMessage {
    id: string;
    channelId: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    content: string;
    attachments?: string[];
    timestamp: string;
    isEdited?: boolean;
}