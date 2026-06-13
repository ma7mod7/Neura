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
    topic?: string;
    isLocked?: boolean;
    unreadCount?: number;
    position?: number;
}

export interface CommunitySpace {
    id: string;        // keyId - used for API calls
    numericId: number;
    name: string;
    imageUrl?: string;
    isPrivate: boolean;
    channels: CommunityChannel[];
}

export interface ReplyPreview {
    id: number;
    senderName: string | null;
    contentPreview: string | null;
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
    isDeleted?: boolean;
    replyToMessageId?: number | null;
    replyPreview?: ReplyPreview | null;
} 

export interface ChannelDto {
    id: number;
    name: string | null;
    topic: string | null;
    type: 0 | 1;   // 0 = text, 1 = voice
    position: number;
}

export interface MessageDto {
    id: number;
    channelId: number;
    senderId: string | null;
    senderName: string | null;
    senderAvatarUrl: string | null;
    content: string | null;
    sentAt: string;
    editedAt: string | null;
    isDeleted: boolean;
    replyToMessageId: number | null;
    replyPreview: ReplyPreview | null;
}

export interface MessagesPageDto {
    messages: MessageDto[] | null;
    nextCursor: number | null;
    hasMore: boolean;
}

export interface CourseMemberDto {
    userId: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    roleName: string | null;
    isOnline: boolean;
    lastSeenAt: string | null;
}