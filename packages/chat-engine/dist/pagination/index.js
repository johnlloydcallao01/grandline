// ============================================================================
// Cursor Encoding/Decoding
// ============================================================================
export function encodeCursor(cursor) {
    const json = JSON.stringify(cursor);
    return typeof Buffer !== 'undefined'
        ? Buffer.from(json).toString('base64')
        : btoa(json);
}
export function decodeCursor(cursorString) {
    try {
        const json = typeof Buffer !== 'undefined'
            ? Buffer.from(cursorString, 'base64').toString('utf-8')
            : atob(cursorString);
        const parsed = JSON.parse(json);
        // Validate cursor structure
        if (typeof parsed.createdAt !== 'string' || typeof parsed.id !== 'number') {
            return null;
        }
        return parsed;
    }
    catch {
        return null;
    }
}
export function buildPaginationQuery(options) {
    const limit = Math.min(Math.max(options.limit, 1), 100); // Clamp between 1-100
    const direction = options.direction === 'backward' ? 'asc' : 'desc';
    return {
        limit: limit + 1, // Fetch one extra to determine if there's more
        orderBy: { column: 'created_at', direction },
        cursor: options.cursor ? decodeCursor(options.cursor) : undefined,
    };
}
// ============================================================================
// Cursor Extraction from Messages
// ============================================================================
export function getCursorFromMessage(message) {
    return {
        createdAt: message.createdAt,
        id: message.id,
    };
}
export function getNextCursor(messages, limit) {
    if (messages.length > limit) {
        // Extra item exists, use it as next cursor
        const lastMessage = messages[limit - 1];
        return encodeCursor(getCursorFromMessage(lastMessage));
    }
    return null;
}
export function getPrevCursor(messages) {
    if (messages.length > 0) {
        const firstMessage = messages[0];
        return encodeCursor(getCursorFromMessage(firstMessage));
    }
    return null;
}
// ============================================================================
// Paginated Result Builder
// ============================================================================
export function buildPaginatedResult(items, limit, direction, getCursor) {
    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    let nextCursor = null;
    let prevCursor = null;
    if (hasMore) {
        if (direction === 'forward') {
            nextCursor = encodeCursor(getCursor(items[limit]));
        }
        else {
            prevCursor = encodeCursor(getCursor(items[limit]));
        }
    }
    // Set prev cursor from first item if not already set
    if (data.length > 0 && !prevCursor && direction === 'forward') {
        prevCursor = encodeCursor(getCursor(data[0]));
    }
    // Set next cursor from last item if not already set
    if (data.length > 0 && !nextCursor && direction === 'backward') {
        nextCursor = encodeCursor(getCursor(data[data.length - 1]));
    }
    return {
        data,
        nextCursor,
        prevCursor,
        hasMore,
    };
}
// ============================================================================
// Message Pagination Helpers
// ============================================================================
export function paginateMessages(messages, options) {
    // Sort messages by created_at and id
    const sorted = [...messages].sort((a, b) => {
        const dateCompare = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (dateCompare !== 0)
            return dateCompare;
        return a.id - b.id;
    });
    // Apply cursor filter if provided
    let filtered = sorted;
    if (options.cursor) {
        const cursor = decodeCursor(options.cursor);
        if (cursor) {
            const cursorTime = new Date(cursor.createdAt).getTime();
            filtered = sorted.filter((msg) => {
                const msgTime = new Date(msg.createdAt).getTime();
                if (options.direction === 'forward') {
                    // Get messages after cursor
                    return msgTime > cursorTime || (msgTime === cursorTime && msg.id > cursor.id);
                }
                else {
                    // Get messages before cursor
                    return msgTime < cursorTime || (msgTime === cursorTime && msg.id < cursor.id);
                }
            });
        }
    }
    // Build paginated result
    return buildPaginatedResult(filtered, options.limit, options.direction, getCursorFromMessage);
}
// ============================================================================
// Default Pagination Options
// ============================================================================
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;
export const MIN_PAGE_SIZE = 1;
export function normalizePaginationOptions(options = {}) {
    const limit = Math.min(Math.max(options.limit ?? DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE), MAX_PAGE_SIZE);
    return {
        limit,
        cursor: options.cursor ?? null,
        direction: options.direction ?? 'forward',
    };
}
export function createInitialPaginationState() {
    return {
        items: [],
        isLoading: false,
        hasMore: true,
        nextCursor: null,
        prevCursor: null,
        error: null,
    };
}
export function appendMessages(state, result) {
    return {
        ...state,
        items: [...state.items, ...result.data],
        hasMore: result.hasMore,
        nextCursor: result.nextCursor,
        prevCursor: result.prevCursor ?? state.prevCursor,
        isLoading: false,
        error: null,
    };
}
export function prependMessages(state, result) {
    return {
        ...state,
        items: [...result.data, ...state.items],
        hasMore: state.hasMore,
        nextCursor: state.nextCursor,
        prevCursor: result.prevCursor,
        isLoading: false,
        error: null,
    };
}
