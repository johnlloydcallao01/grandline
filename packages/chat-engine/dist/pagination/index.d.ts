import type { PaginationOptions, PaginatedResult, MessageCursor, ChatMessage } from '../types/index.js';
export declare function encodeCursor(cursor: MessageCursor): string;
export declare function decodeCursor(cursorString: string): MessageCursor | null;
export interface PaginationQuery {
    limit: number;
    orderBy: {
        column: string;
        direction: 'asc' | 'desc';
    };
    cursor?: MessageCursor | null;
    filters?: Record<string, unknown>;
}
export declare function buildPaginationQuery(options: PaginationOptions): PaginationQuery;
export declare function getCursorFromMessage(message: ChatMessage): MessageCursor;
export declare function getNextCursor(messages: ChatMessage[], limit: number): string | null;
export declare function getPrevCursor(messages: ChatMessage[]): string | null;
export declare function buildPaginatedResult<T>(items: T[], limit: number, direction: 'forward' | 'backward', getCursor: (item: T) => MessageCursor): PaginatedResult<T>;
export declare function paginateMessages(messages: ChatMessage[], options: PaginationOptions): PaginatedResult<ChatMessage>;
export declare const DEFAULT_PAGE_SIZE = 50;
export declare const MAX_PAGE_SIZE = 100;
export declare const MIN_PAGE_SIZE = 1;
export declare function normalizePaginationOptions(options?: Partial<PaginationOptions>): PaginationOptions;
export interface PaginationState {
    items: ChatMessage[];
    isLoading: boolean;
    hasMore: boolean;
    nextCursor: string | null;
    prevCursor: string | null;
    error: Error | null;
}
export declare function createInitialPaginationState(): PaginationState;
export declare function appendMessages(state: PaginationState, result: PaginatedResult<ChatMessage>): PaginationState;
export declare function prependMessages(state: PaginationState, result: PaginatedResult<ChatMessage>): PaginationState;
//# sourceMappingURL=index.d.ts.map