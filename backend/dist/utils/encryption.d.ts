export declare function encrypt(text: string): string;
export declare function decrypt(encryptedText: string): string;
export declare function hashForSearch(text: string): string;
export declare function hashPassword(password: string): Promise<string>;
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
export declare function generateSecureToken(length?: number): string;
//# sourceMappingURL=encryption.d.ts.map