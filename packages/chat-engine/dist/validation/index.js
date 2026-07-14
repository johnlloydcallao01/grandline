// ============================================================================
// Message Content Validation
// ============================================================================
const DEFAULT_MAX_MESSAGE_LENGTH = 4000;
const MIN_MESSAGE_LENGTH = 1;
const ALLOWED_MESSAGE_TYPES = ['text', 'image', 'file', 'system'];
export function validateMessageContent(content, options = {}) {
    const maxLength = options.maxLength ?? DEFAULT_MAX_MESSAGE_LENGTH;
    const minLength = options.minLength ?? MIN_MESSAGE_LENGTH;
    const allowEmpty = options.allowEmpty ?? false;
    // Check for empty or whitespace-only content
    if (!content || content.trim().length === 0) {
        if (allowEmpty) {
            return { valid: true };
        }
        return {
            valid: false,
            error: 'Message content cannot be empty',
            code: 'EMPTY_CONTENT'
        };
    }
    const trimmedContent = content.trim();
    // Check minimum length
    if (trimmedContent.length < minLength) {
        return {
            valid: false,
            error: `Message must be at least ${minLength} character(s)`,
            code: 'MIN_LENGTH'
        };
    }
    // Check maximum length
    if (trimmedContent.length > maxLength) {
        return {
            valid: false,
            error: `Message exceeds maximum length of ${maxLength} characters`,
            code: 'MAX_LENGTH_EXCEEDED'
        };
    }
    // Check for potentially dangerous content (basic XSS prevention)
    const dangerousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi // onclick, onerror, etc.
    ];
    for (const pattern of dangerousPatterns) {
        if (pattern.test(trimmedContent)) {
            return {
                valid: false,
                error: 'Message contains potentially harmful content',
                code: 'DANGEROUS_CONTENT'
            };
        }
    }
    return { valid: true };
}
export function validateMessageType(type) {
    if (!ALLOWED_MESSAGE_TYPES.includes(type)) {
        return {
            valid: false,
            error: `Invalid message type. Allowed types: ${ALLOWED_MESSAGE_TYPES.join(', ')}`,
            code: 'INVALID_TYPE'
        };
    }
    return { valid: true };
}
export function validateReplyChain(replyToMessageId, maxDepth = 10) {
    if (replyToMessageId === null || replyToMessageId === undefined) {
        return { valid: true };
    }
    if (typeof replyToMessageId !== 'number' || replyToMessageId <= 0) {
        return {
            valid: false,
            error: 'Invalid reply message ID',
            code: 'INVALID_REPLY_ID'
        };
    }
    return { valid: true };
}
export function validateAttachmentUrls(urls) {
    if (!Array.isArray(urls)) {
        return {
            valid: false,
            error: 'Attachments must be an array',
            code: 'INVALID_ATTACHMENTS_FORMAT'
        };
    }
    const maxAttachments = 10;
    if (urls.length > maxAttachments) {
        return {
            valid: false,
            error: `Maximum ${maxAttachments} attachments allowed`,
            code: 'MAX_ATTACHMENTS_EXCEEDED'
        };
    }
    const urlPattern = /^https?:\/\/.+/i;
    for (const url of urls) {
        if (typeof url !== 'string' || !urlPattern.test(url)) {
            return {
                valid: false,
                error: `Invalid attachment URL: ${url}`,
                code: 'INVALID_ATTACHMENT_URL'
            };
        }
    }
    return { valid: true };
}
// ============================================================================
// Chat Business Rules Validation
// ============================================================================
export function isParticipant(userId, chat) {
    return chat.participants.some(p => p.userId === userId);
}
export function canSendToChat(userId, chat) {
    if (chat.status === 'archived') {
        return {
            valid: false,
            error: 'Cannot send messages to archived chats',
            code: 'CHAT_ARCHIVED'
        };
    }
    if (chat.status === 'closed') {
        return {
            valid: false,
            error: 'Cannot send messages to closed chats',
            code: 'CHAT_CLOSED'
        };
    }
    if (chat.type !== 'group' && !isParticipant(userId, chat)) {
        return {
            valid: false,
            error: 'You are not a participant in this chat',
            code: 'NOT_PARTICIPANT'
        };
    }
    return { valid: true };
}
export function canEditMessage(userId, message, maxEditMinutes = 30) {
    // Only the sender can edit their own messages
    if (message.senderId !== userId) {
        return {
            valid: false,
            error: 'You can only edit your own messages',
            code: 'NOT_MESSAGE_OWNER'
        };
    }
    // Check if message is too old to edit
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    const maxEditMs = maxEditMinutes * 60 * 1000;
    if (messageAge > maxEditMs) {
        return {
            valid: false,
            error: `Messages can only be edited within ${maxEditMinutes} minutes`,
            code: 'EDIT_WINDOW_EXPIRED'
        };
    }
    return { valid: true };
}
export function canDeleteMessage(userId, message, userRole, maxDeleteMinutes = 60) {
    // Admins and instructors can delete any message in their chats
    if (userRole === 'admin' || userRole === 'instructor') {
        return { valid: true };
    }
    // Senders can delete their own messages within time limit
    if (message.senderId === userId) {
        const messageAge = Date.now() - new Date(message.createdAt).getTime();
        const maxDeleteMs = maxDeleteMinutes * 60 * 1000;
        if (messageAge > maxDeleteMs) {
            return {
                valid: false,
                error: `Messages can only be deleted within ${maxDeleteMinutes} minutes`,
                code: 'DELETE_WINDOW_EXPIRED'
            };
        }
        return { valid: true };
    }
    return {
        valid: false,
        error: 'You do not have permission to delete this message',
        code: 'DELETE_NOT_ALLOWED'
    };
}
export function canAddReaction(userId, chat, existingReactions) {
    if (!isParticipant(userId, chat)) {
        return {
            valid: false,
            error: 'Only chat participants can add reactions',
            code: 'NOT_PARTICIPANT'
        };
    }
    // Check if user already has too many reactions on this message
    const userReactionCount = existingReactions.filter(r => r.userId === userId).length;
    const maxReactionsPerUser = 5;
    if (userReactionCount >= maxReactionsPerUser) {
        return {
            valid: false,
            error: `Maximum ${maxReactionsPerUser} reactions per user on a message`,
            code: 'MAX_REACTIONS_EXCEEDED'
        };
    }
    return { valid: true };
}
// ============================================================================
// Chat Type Rules
// ============================================================================
const CHAT_TYPE_RULES = {
    support: { minParticipants: 2, maxParticipants: 2 },
    instructor_trainee: { minParticipants: 2, maxParticipants: 2 },
    admin_user: { minParticipants: 2, maxParticipants: 2 },
    group: { minParticipants: 2, maxParticipants: 100 }
};
export function validateChatParticipants(chatType, participants) {
    const rules = CHAT_TYPE_RULES[chatType];
    if (!rules) {
        return {
            valid: false,
            error: 'Unknown chat type',
            code: 'INVALID_CHAT_TYPE'
        };
    }
    if (participants.length < rules.minParticipants) {
        return {
            valid: false,
            error: `${chatType} chats require at least ${rules.minParticipants} participants`,
            code: 'INSUFFICIENT_PARTICIPANTS'
        };
    }
    if (participants.length > rules.maxParticipants) {
        return {
            valid: false,
            error: `${chatType} chats cannot exceed ${rules.maxParticipants} participants`,
            code: 'TOO_MANY_PARTICIPANTS'
        };
    }
    // Check for duplicate participants
    const userIds = participants.map(p => p.userId);
    const uniqueUserIds = new Set(userIds);
    if (uniqueUserIds.size !== userIds.length) {
        return {
            valid: false,
            error: 'Duplicate participants are not allowed',
            code: 'DUPLICATE_PARTICIPANTS'
        };
    }
    return { valid: true };
}
export function validateNewMessage(input, options = {}) {
    // Validate content
    const contentValidation = validateMessageContent(input.content, options);
    if (!contentValidation.valid)
        return contentValidation;
    // Validate type
    const typeValidation = validateMessageType(input.type);
    if (!typeValidation.valid)
        return typeValidation;
    // Validate reply chain
    const replyValidation = validateReplyChain(input.replyToMessageId);
    if (!replyValidation.valid)
        return replyValidation;
    // Validate attachments if present
    if (input.attachments && input.attachments.length > 0) {
        const attachmentValidation = validateAttachmentUrls(input.attachments);
        if (!attachmentValidation.valid)
            return attachmentValidation;
    }
    return { valid: true };
}
