import type { ChatMessage, ChatMessageReaction, ChatUser, FormattedMessage, MessageStatus, UserRole } from '../types/index.js';
export declare function formatMessage(message: ChatMessage, currentUserId: number): FormattedMessage;
export declare function formatReactions(reactions: ChatMessageReaction[], currentUserId: number): {
    emoji: string;
    count: number;
    hasOwn: boolean;
}[];
export declare function generateMessagePreview(message: ChatMessage, maxLength?: number): string;
export declare function updateMessageStatus(formattedMessage: FormattedMessage, status: MessageStatus, userId: number, currentUserId: number): FormattedMessage;
export declare function formatTypingIndicator(typingUsers: {
    userId: number;
    user?: ChatUser;
    isTyping: boolean;
}[]): string;
export declare function formatTime(timestamp: string): string;
export declare function formatDate(timestamp: string): string;
export declare function formatRelativeTime(timestamp: string): string;
export declare function formatMessageTimeGroup(timestamp: string): string;
export interface ChatListItem {
    id: number;
    title: string;
    lastMessagePreview: string;
    lastMessageTime: string;
    unreadCount: number;
    participants: {
        id: number;
        name: string;
        avatar?: string | null;
    }[];
    isActive: boolean;
}
export declare function formatChatListItem(chat: {
    id: number;
    title?: string | null;
    lastMessagePreview?: string | null;
    lastMessageAt?: string | null;
    status: string;
    participants: ChatUser[];
}, currentUserId: number, unreadCount?: number): ChatListItem;
export declare function formatUserName(user: ChatUser | undefined): string;
export declare function formatUserInitials(user: ChatUser | undefined): string;
export declare function getRoleDisplayName(role: UserRole): string;
//# sourceMappingURL=index.d.ts.map