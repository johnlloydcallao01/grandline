import type { SupabaseClient } from '@supabase/supabase-js';
import type { RealtimeEventHandler, ChannelState } from '../types/index.js';
export declare function getChatChannelName(chatId: number): string;
export declare function getMessagesChannelName(chatId: number): string;
export declare function getTypingChannelName(chatId: number): string;
export declare class ChatChannelManager {
    private supabase;
    private channels;
    private handlers;
    private channelStates;
    private typingStates;
    constructor(supabase: SupabaseClient);
    subscribeToChat(chatId: number, handler: RealtimeEventHandler): () => void;
    private createChatChannel;
    private emitEvent;
    unsubscribeFromChat(chatId: number, handler?: RealtimeEventHandler): void;
    private unsubscribeChannel;
    getChannelStatus(chatId: number): ChannelState | undefined;
    isSubscribed(chatId: number): boolean;
    sendTypingIndicator(chatId: number, userId: number, isTyping: boolean): Promise<void>;
    setTyping(chatId: number, userId: number, isTyping: boolean, debounceMs?: number): void;
    disconnect(): void;
}
//# sourceMappingURL=index.d.ts.map