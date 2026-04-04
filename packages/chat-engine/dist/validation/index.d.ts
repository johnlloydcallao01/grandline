import type { ValidationResult, ValidationOptions, ChatMessage, UserRole, Chat, ChatParticipant } from '../types/index.js';
export declare function validateMessageContent(content: string, options?: ValidationOptions): ValidationResult;
export declare function validateMessageType(type: string): ValidationResult;
export declare function validateReplyChain(replyToMessageId: number | null | undefined, maxDepth?: number): ValidationResult;
export declare function validateAttachmentUrls(urls: string[]): ValidationResult;
export declare function isParticipant(userId: number, chat: Chat): boolean;
export declare function canSendToChat(userId: number, chat: Chat): ValidationResult;
export declare function canEditMessage(userId: number, message: ChatMessage, maxEditMinutes?: number): ValidationResult;
export declare function canDeleteMessage(userId: number, message: ChatMessage, userRole: UserRole, maxDeleteMinutes?: number): ValidationResult;
export declare function canAddReaction(userId: number, chat: Chat, existingReactions: {
    userId: number;
    emoji: string;
}[]): ValidationResult;
export declare function validateChatParticipants(chatType: Chat['type'], participants: ChatParticipant[]): ValidationResult;
export interface MessageValidationInput {
    content: string;
    type: string;
    replyToMessageId?: number | null;
    attachments?: string[];
}
export declare function validateNewMessage(input: MessageValidationInput, options?: ValidationOptions): ValidationResult;
//# sourceMappingURL=index.d.ts.map