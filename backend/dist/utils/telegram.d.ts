export declare function saveChatId(phone: string, chatId: number): void;
export declare function getChatId(phone: string): number | undefined;
export declare function sendOtpViaTelegram(phone: string, otp: string): Promise<boolean>;
export declare function processTelegramUpdate(update: any): void;
export declare function setupTelegramWebhook(serverUrl: string): Promise<void>;
//# sourceMappingURL=telegram.d.ts.map