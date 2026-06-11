export { default as CommunityApp } from './pages/CommunityApp';
export { default as CommunityAdminDashboard } from './pages/CommunityAdminDashboard';

export { useChannels } from './hooks/useChannels';
export { useMessages } from './hooks/useMessages';
export { useMembers } from './hooks/useMembers';
export { useSignalR } from './hooks/useSignalR';
export { useSpaces } from './hooks/useSpaces';

export type {
    CommunitySpace, CommunityChannel, CommunityMessage, CommunityMember,
    ChannelDto, MessageDto, CourseMemberDto, ChannelType, Role, UserStatus,
} from './types/communityTypes';